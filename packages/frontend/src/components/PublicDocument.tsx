import React, { FC, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { DialogModal, Document, Icon, useTranslate } from "@bitbloq/ui";
import Loading from "./Loading";
import DocumentInfo from "./DocumentInfo";
import SaveCopyModal from "./SaveCopyModal";
import {
  DOCUMENTS_QUERY,
  OPEN_PUBLIC_DOCUMENT_QUERY,
  CREATE_DOCUMENT_MUTATION
} from "../apollo/queries";
import { documentTypes } from "../config";
import useUserData from "../lib/useUserData";

interface PublicDocumentProps {
  id: string;
  type: string;
}

const PublicDocument: FC<PublicDocumentProps> = ({ id, type }) => {
  const documentType = documentTypes[type];
  const EditorComponent = documentType.editorComponent;

  const [tabIndex, setTabIndex] = useState(1);
  const [isSaveCopyVisible, setIsSaveCopyVisible] = useState(false);
  const [isRestartModalVisible, setIsRestartModalVisible] = useState(false);
  const [initialContent, setInitialContent] = useState([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [content, setContent] = useState([]);
  const [restartCount, setRestartCount] = useState(0);

  const t = useTranslate();

  const { data, loading, error } = useQuery(OPEN_PUBLIC_DOCUMENT_QUERY, {
    variables: { id }
  });

  const userData = useUserData();

  const [createDocument] = useMutation(CREATE_DOCUMENT_MUTATION);

  const { openPublicDocument: document = {} } = data || {};

  const restart = () => {
    setRestartCount(restartCount + 1);
    setContent(initialContent);
    setIsRestartModalVisible(false);
  };

  useEffect(() => {
    if (document && document.content) {
      try {
        const c = JSON.parse(document.content);
        setInitialContent(c);
        restart();
        setContent(c);
        setContentLoaded(true);
      } catch (e) {
        console.warn("Error parsing document content", e);
      }
    }
  }, [document]);

  if (loading || !contentLoaded)
    return <Loading color={documentType.color} />;
  if (error) return <p>Error :)</p>;

  const onSaveCopyClick = () => {
    setIsSaveCopyVisible(true);
  };

  const onRestartClick = () => {
    setIsRestartModalVisible(true);
  };

  const onContentChange = (content: any) => {
    setContent(content);
  };

  const onSaveDocument = () => {
    const documentJSON = {
      ...document,
      content: JSON.stringify(content)
    };
    var blob = new Blob([JSON.stringify(documentJSON)], {
      type: "text/json;charset=utf-8"
    });
    saveAs(blob, `${document.title}.bitbloq`);
  };

  const saveCopy = (email: string, password: string) => {
    createDocument({
      variables: {
        ...document,
        content: JSON.stringify(content)
      },
      context: email && password ? { email, password } : {},
      refetchQueries: userData ? [{ query: DOCUMENTS_QUERY }] : []
    });
    setIsSaveCopyVisible(false);
  };

  return (
    <>
      <EditorComponent
        brandColor={documentType.color}
        key={restartCount}
        content={initialContent}
        tabIndex={tabIndex}
        onTabChange={setTabIndex}
        onSaveDocument={onSaveDocument}
        onContentChange={onContentChange}
        title={
          <>
            <TitleIcon>
              <Icon name="view-document" />
            </TitleIcon>
            <span>{document.title}</span>
          </>
        }
        getTabs={mainTab => [
          mainTab,
          <Document.Tab
            key="info"
            icon={<Icon name="info" />}
            label={t("tab-project-info")}
          >
            <DocumentInfo
              document={document}
              onGotoDocument={() => setTabIndex(0)}
            />
          </Document.Tab>
        ]}
        headerButtons={[
          { id: "save-copy", icon: "add-document" },
          { id: "restart", icon: "reload" }
        ]}
        onHeaderButtonClick={(buttonId: string) => {
          switch (buttonId) {
            case "save-copy":
              onSaveCopyClick();
              break;
            case "restart":
              onRestartClick();
              break;
          }
        }}
        isPlayground
      />
      {isSaveCopyVisible && (
        <SaveCopyModal
          user={userData}
          onSave={saveCopy}
          onCancel={() => setIsSaveCopyVisible(false)}
        />
      )}
      <DialogModal
        isOpen={isRestartModalVisible}
        title="Aviso"
        text="¿Seguro que quieres reiniciar el ejercicio? Si lo haces perderás todo lo que hayas hecho y el ejercicio volverá a su estado original."
        okText="Aceptar"
        cancelText="Cancelar"
        onOk={() => restart()}
        onCancel={() => setIsRestartModalVisible(false)}
      />
    </>
  );
};

export default PublicDocument;

const TitleIcon = styled.span`
  svg {
    width: 28px;
    height: 28px;
    margin-right: 10px;
  }
`;
