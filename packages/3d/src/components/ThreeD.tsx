import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from "react";
import update from "immutability-helper";
import styled from "@emotion/styled";
import {
  Object3D,
  Operation,
  isTranslateOperation,
  isRotationOperation,
  isScaleOperation,
  Scene,
  IObjectsCommonJSON,
  IHelperDescription
} from "@bitbloq/lib3d";

import ObjectTree from "./ObjectTree";
import ThreeDViewer from "./ThreeDViewer";
import Toolbar from "./Toolbar";
import PropertiesPanel from "./PropertiesPanel";
import config from "../config";
import { getRandomColor, createObjectName, findObject } from "../util";
import { IShapeGroup } from "../types";

export interface IThreeDRef {
  createObject: (type: string, paramaterers: any, name: string) => void;
  exportToSTL: (name: string, separate: boolean) => void;
}

export interface IThreeDProps {
  initialContent?: any;
  addShapeGroups: (base: IShapeGroup[]) => IShapeGroup[];
  advancedMode: boolean;
  onContentChange: (content: IObjectsCommonJSON[]) => any;
  threeDRef?: { current: IThreeDRef | null };
}

const ThreeD: React.FC<IThreeDProps> = ({
  initialContent,
  addShapeGroups,
  advancedMode,
  onContentChange,
  threeDRef
}) => {
  const sceneRef = useRef<Scene | null>(null);
  const initialObjectsRef = useRef<IObjectsCommonJSON[]>([]);
  const [objects, setObjects] = useState<IObjectsCommonJSON[]>([]);
  const objectsRef = useRef(objects);

  useEffect(() => {
    if (sceneRef.current && objects !== initialObjectsRef.current) {
      onContentChange(objects);
    }
    objectsRef.current = objects;
  }, [objects]);

  useEffect(() => {
    sceneRef.current = Scene.newFromJSON(initialContent);
    initialObjectsRef.current = sceneRef.current.toJSON();
    setObjects(initialObjectsRef.current);
  }, []);

  const scene = sceneRef.current || new Scene();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedIdsRef = useRef(selectedIds);

  const selectedObjects = useMemo(
    () =>
      selectedIds
        .map(id => findObject(objects, object => object.id === id)!)
        .filter(o => o),
    [objects, selectedIds]
  );

  const [
    activeOperation,
    setActiveOperation
  ] = useState<IHelperDescription | null>(null);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setActiveOperation(null);
    }
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  const onCreateObject = useCallback(
    (object: IObjectsCommonJSON) => {
      const newObjects = scene.addNewObjectFromJSON(
        update(object, {
          viewOptions: {
            color: { $set: getRandomColor() },
            name: {
              $set: createObjectName(
                object.viewOptions.name || object.type,
                objects
              )
            }
          }
        })
      );
      setObjects(newObjects);
      setSelectedIds([newObjects[newObjects.length - 1].id]);
    },
    [scene]
  );

  const onDeleteObject = (object: IObjectsCommonJSON) => {
    setObjects(scene.removeObject(object));
  };

  const onUndoObject = (object: IObjectsCommonJSON) => {
    setObjects(scene.undoObject(object));
  };

  const onConvertToGroup = (object: IObjectsCommonJSON) => {
    setObjects(scene.convertToGroup(object));
  };

  const onDuplicateObject = (object: IObjectsCommonJSON) => {
    setObjects(
      scene.cloneOject(
        update(object, {
          viewOptions: {
            name: {
              $set: createObjectName(
                object.viewOptions.name || object.type,
                objects
              )
            }
          }
        })
      )
    );
  };

  const onUpdateObjectsOrder = useCallback(
    (orderedObjectIds: string[]) =>
      setObjects(scene.updateObjectsOrder(orderedObjectIds)),
    [scene]
  );

  const onSetActiveOperation = (helper: IHelperDescription) => {
    setActiveOperation(helper);
  };

  const onUnsetActiveOperation = () => {
    setActiveOperation(null);
  };

  const previousAdvancedMode = useRef<boolean>(advancedMode);

  useEffect(() => {
    if (advancedMode && !previousAdvancedMode.current) {
      // Convert operations to advance mode
      objects.forEach(object => {
        const operations: Operation[] = [];
        object.operations.forEach(operation => {
          if (isTranslateOperation(operation)) {
            if (operation.x !== 0 || operation.y !== 0 || operation.z !== 0) {
              operations.push(operation);
            }
          }
          if (isRotationOperation(operation)) {
            if (operation.x !== 0) {
              operations.push(
                Object3D.createRotateOperation(operation.x, 0, 0)
              );
            }
            if (operation.y !== 0) {
              operations.push(
                Object3D.createRotateOperation(0, operation.y, 0)
              );
            }
            if (operation.z !== 0) {
              operations.push(
                Object3D.createRotateOperation(0, 0, operation.z)
              );
            }
          }
          if (isScaleOperation(operation)) {
            if (operation.x !== 1 || operation.y !== 1 || operation.z !== 1) {
              operations.push(operation);
            }
          }
        });
        setObjects(scene.updateObject({ ...object, operations }));
      });
    }

    if (!advancedMode && previousAdvancedMode.current) {
      // Convert operations to basic mode
      objects.forEach(object => {
        const { position, angle, scale } = scene.getLocalPosition(object);
        setObjects(
          scene.updateObject({
            ...object,
            operations: [
              Object3D.createTranslateOperation(
                position.x,
                position.y,
                position.z
              ),
              Object3D.createRotateOperation(angle.x, angle.y, angle.z),
              Object3D.createScaleOperation(scale.x, scale.y, scale.z)
            ]
          })
        );
      });
    }
    previousAdvancedMode.current = advancedMode;
  }, [advancedMode]);

  // Keyboard handling
  const controlPressed = useRef(false);
  const shiftPressed = useRef(false);

  const onUndo = useCallback(() => {
    setObjects(scene.undo());
  }, [scene]);

  const onRedo = useCallback(() => {
    setObjects(scene.redo());
  }, [scene]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        controlPressed.current = true;
      }
      if (e.key === "Shift") {
        shiftPressed.current = true;
      }
      if (e.key === "z" && controlPressed.current) {
        if (scene.canUndo()) {
          setObjects(scene.undo());
        }
      }
      if (e.key === "Z" && controlPressed.current) {
        if (scene.canRedo()) {
          setObjects(scene.redo());
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        controlPressed.current = false;
      }
      if (e.key === "Shift") {
        shiftPressed.current = false;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [scene]);

  const onObjectClick = useCallback((object?: IObjectsCommonJSON) => {
    if (object) {
      const isTop = objectsRef.current.some(o => o.id === object.id);
      const isSelectedTop = objectsRef.current.some(o =>
        selectedIdsRef.current.includes(o.id)
      );
      const isSelected = selectedIdsRef.current.includes(object.id);

      if (
        isTop &&
        isSelectedTop &&
        (controlPressed.current || shiftPressed.current)
      ) {
        if (isSelected) {
          setSelectedIds(selectedIdsRef.current.filter(id => id !== object.id));
        } else {
          setSelectedIds([...selectedIdsRef.current, object.id]);
        }
      } else {
        if (isSelected && selectedIdsRef.current.length === 1) {
          setSelectedIds(selectedIdsRef.current.filter(id => id !== object.id));
        } else {
          setSelectedIds([object.id]);
        }
      }
    } else {
      setSelectedIds([]);
    }
  }, []);

  const onUpdateObject = useCallback(
    (object: IObjectsCommonJSON) => {
      setObjects(scene.updateObject(object));
    },
    [scene]
  );

  const onBackgroundClick = useCallback(() => {
    setSelectedIds([]);
  }, []);

  useEffect(() => {
    if (threeDRef) {
      threeDRef.current = {
        createObject: (type, parameters, name) => {
          const object = {
            type,
            parameters,
            id: "",
            operations: config.defaultOperations(advancedMode),
            viewOptions: {
              name,
              color:
                config.colors[Math.floor(Math.random() * config.colors.length)]
            }
          };
          if (sceneRef.current) {
            setObjects(sceneRef.current.addNewObjectFromJSON(object));
          }
        },
        exportToSTL: (name, separate) => {
          const nameToPass = name === "" ? "scene" : name;
          if (sceneRef.current) {
            sceneRef.current.exportToSTLAsync(nameToPass, separate);
          }
        }
      };
    }
  }, [threeDRef]);

  const baseShapeGroups = config.addShapeGroups;
  const shapeGroups = useMemo(
    () => (addShapeGroups ? addShapeGroups(baseShapeGroups) : baseShapeGroups),
    [addShapeGroups]
  );

  return (
    <Container>
      <ObjectTree
        objects={objects}
        selectedObjects={selectedObjects}
        advancedMode={advancedMode}
        shapeGroups={shapeGroups}
        onCreateObject={onCreateObject}
        onUpdateObject={onUpdateObject}
        onDeleteObject={onDeleteObject}
        onObjectClick={onObjectClick}
        onUpdateObjectsOrder={onUpdateObjectsOrder}
      />
      <MainArea>
        <Toolbar
          objects={objects}
          selectedObjects={selectedObjects}
          advancedMode={advancedMode}
          onCreateObject={onCreateObject}
          canUndo={scene.canUndo()}
          canRedo={scene.canRedo()}
          onUndo={onUndo}
          onRedo={onRedo}
        />
        <ThreeDViewer
          activeOperation={activeOperation}
          sceneObjects={objects}
          scene={scene}
          selectedObjects={selectedObjects}
          onObjectClick={onObjectClick}
          onBackgroundClick={onBackgroundClick}
        />
      </MainArea>
      {selectedObjects[0] && (
        <PropertiesPanel
          advancedMode={advancedMode}
          object={selectedObjects[0]}
          isTopObject={
            selectedObjects[0] && objects.includes(selectedObjects[0])
          }
          onUpdateObject={onUpdateObject}
          onDeleteObject={onDeleteObject}
          onUndoObject={onUndoObject}
          onConvertToGroup={onConvertToGroup}
          onDuplicateObject={onDuplicateObject}
          onSetActiveOperation={onSetActiveOperation}
          onUnsetActiveOperation={onUnsetActiveOperation}
        />
      )}
    </Container>
  );
};

export default ThreeD;

/* styled components */

const Container = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
