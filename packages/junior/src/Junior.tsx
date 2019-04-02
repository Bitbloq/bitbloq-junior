import React, { useState, useEffect, useRef } from "react";
import update from "immutability-helper";
import styled from "@emotion/styled";
import { Document, Icon, useTranslate } from "@bitbloq/ui";
import {
  HorizontalBloqEditor,
  HardwareDesigner,
  bloqs2code,
  IBloq,
  IBloqType,
  IBloqTypeGroup,
  IBoard,
  IComponent,
  IHardware
} from "@bitbloq/bloqs";

export interface JuniorProps {
  brandColor: string;
  title: string;
  onEditTitle: () => any;
  tabIndex: number;
  onTabChange: (tabIndex: number) => any;
  bloqTypes: IBloqType[];
  initialContent?: any;
  onContentChange: (content: any) => any;
  boards: IBoard[];
  components: IComponent[];
}

const Junior: React.FunctionComponent<JuniorProps> = ({
  children,
  brandColor,
  title,
  onEditTitle,
  tabIndex,
  onTabChange,
  bloqTypes,
  initialContent,
  onContentChange,
  boards,
  components
}) => {
  const t = useTranslate();

  const [content, setContent] = useState(initialContent);
  const program = content.program || [];
  const hardware: IHardware = content.hardware || {
    board: "zumjunior",
    components: []
  };

  const componentMapRef = useRef<{ [key: string]: IComponent }>();
  useEffect(() => {
    componentMapRef.current = components.reduce((map, c) => {
      map[c.name] = c;
      return map;
    }, {});
  }, [components]);

  const componentMap = componentMapRef.current || {};

  const getComponents = (types: string[]) =>
    hardware.components.filter(c =>
      types.some(name =>
        isInstanceOf(componentMap[c.component], name, componentMap)
      )
    );

  const availableBloqs = bloqTypes.filter(bloq =>
    !bloq.components || bloq.components.some(bloqComponent =>
      hardware.components.some(c =>
        isInstanceOf(
          componentMap[c.component],
          bloqComponent,
          componentMap
        )
      )
    )
  );

  const onHeaderButtonClick = (id: string) => {
    switch (id) {
      case "compile":
        const code = bloqs2code(
          boards,
          components,
          bloqTypes,
          hardware,
          program
        );
        console.log("CODE:", code);
        return;
    }
  };

  const mainTabs = [
    <Document.Tab
      key="hardware"
      icon={<Icon name="hardware" />}
      label={t("hardware")}
    >
      <HardwareDesigner
        boards={boards}
        components={components}
        hardware={hardware}
        onHardwareChange={newHardware =>
          setContent(update(content, { hardware: { $set: newHardware } }))
        }
      />
    </Document.Tab>,
    <Document.Tab
      key="software"
      icon={<Icon name="programming" />}
      label={t("software")}
    >
      <HorizontalBloqEditor
        bloqs={program}
        getComponents={getComponents}
        bloqTypes={availableBloqs}
        onBloqsChange={(newProgram: IBloq[][]) =>
          setContent(update(content, { program: { $set: newProgram } }))
        }
      />
    </Document.Tab>
  ];

  return (
    <Document
      brandColor={brandColor}
      title={title || t("untitled-project")}
      onEditTitle={onEditTitle}
      tabIndex={tabIndex}
      onTabChange={onTabChange}
      onHeaderButtonClick={onHeaderButtonClick}
      headerButtons={[{ id: "compile", icon: "tick" }]}
    >
      {typeof children === "function" ? children(mainTabs) : mainTabs}
    </Document>
  );
};

export const isInstanceOf = (
  component: IComponent,
  name: string,
  componentsMap: { [key: string]: IComponent }
): boolean => {
  if (component.name === name) {
    return true;
  }

  if (component.extends) {
    const parentComponent = componentsMap[component.extends];
    if (parentComponent) {
      return isInstanceOf(parentComponent, name, componentsMap);
    }
  }

  return false;
};

export default Junior;
