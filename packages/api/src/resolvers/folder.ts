import { ApolloError, withFilter } from "apollo-server-koa";
import { DocumentModel, IDocument } from "../models/document";
import { FolderModel, IFolder } from "../models/folder";
import { IUser, UserModel } from "../models/user";
import documentResolver from "./document";

import { pubsub } from "../server";
const FOLDER_UPDATED: string = "FOLDER_UPDATED";

import { logger, loggerController } from "../controllers/logs";

const getParentsPath = async (folder: IFolder) => {
  let path = [];
  if ((folder.name = "root")) {
    return [folder, ...path];
  } else {
    return [
      this.parentsPath(await FolderModel.findOne({ _id: folder.parent })),
      folder,
      ...path
    ];
  }
};

const duplicateFolderChildren = async (folder, userID) => {
  if (folder.name === "root") {
    return folder;
  } else {
    const folderOriginalChildren: IFolder[] = await FolderModel.find({
      parent: folder._id
    });
    const docsOriginalChildren: IDocument[] = await DocumentModel.find({
      folder: folder._id
    });
    const newFolder: IFolder = await FolderModel.create({
      name: folder.name,
      parent: folder.parent,
      user: userID
    });
    let folderChildren: string[] = [],
      docsChildren: string[] = [];
    if (docsOriginalChildren.length > 0) {
      for (let item of docsOriginalChildren) {
        const newItem = await DocumentModel.create({
          user: userID,
          title: item.title,
          type: item.type,
          content: item.content,
          advancedMode: item.advancedMode,
          cache: item.cache,
          description: item.description,
          version: item.version,
          image: item.image,
          folder: newFolder._id
        });
        docsChildren.push(newItem._id);
      }
    }
    if (folderOriginalChildren.length > 0) {
      for (let item of folderOriginalChildren) {
        const newItem = await FolderModel.create({
          name: item.name,
          parent: newFolder._id,
          user: userID
        });
        folderChildren.push(newItem._id);
      }
    }
    await FolderModel.updateOne(
      { _id: newFolder._id },
      {
        foldersID: folderChildren,
        documentsID: docsChildren
      },
      { new: true }
    );
    // if (folderOriginalChildren.length > 0) {
    //   for (let item of folderOriginalChildren) {
    //     console.log(item);
    //     duplicateFolderChildren(item, userID);
    //   }
    // }
    console.log("\n duplica carpeta api \n");
    return;
  }
};

const folderResolver = {
  Subscription: {
    folderUpdated: {
      subscribe: withFilter(
        // Filtra para devolver solo los documentos del usuario
        () => pubsub.asyncIterator([FOLDER_UPDATED]),
        (payload, variables, context) => {
          return (
            String(context.user.userID) === String(payload.folderUpdated.user)
          );
        }
      )
    }
  },

  Mutation: {
    /**
     * Create folder: create a new empty folder.
     * args: folder information
     */
    createFolder: async (root: any, args: any, context: any) => {
      const user: IUser = await UserModel.findOne({ _id: context.user.userID });
      if (args.input.parent) {
        if (!(await FolderModel.findOne({ _id: args.input.parent }))) {
          throw new ApolloError(
            "Parent folder does not exist",
            "PARENT_NOT_FOUND"
          );
        }
      }
      const folderNew: IFolder = new FolderModel({
        name: args.input.name,
        user: context.user.userID,
        parent: args.input.parent || user.rootFolder
      });
      const newFolder: IFolder = await FolderModel.create(folderNew);
      await FolderModel.findOneAndUpdate(
        { _id: folderNew.parent },
        { $push: { foldersID: newFolder._id } },
        { new: true }
      );
      loggerController.storeInfoLog(
        "API",
        "space",
        "create",
        "folder",
        newFolder.user,
        ""
      );
      pubsub.publish(FOLDER_UPDATED, { folderUpdated: newFolder });
      return newFolder;
    },

    /**
     * Delete folder: delete one folder of the user logged.
     * It deletes the folder passed in the arguments if it belongs to the user logged.
     * The method deletes all the documents inside de document
     * args: folder ID
     */
    deleteFolder: async (root: any, args: any, context: any) => {
      const existFolder: IFolder = await FolderModel.findOne({
        _id: args.id,
        user: context.user.userID
      });
      if (!existFolder) {
        throw new ApolloError("Folder does not exist", "FOLDER_NOT_FOUND");
      }
      if (existFolder.name == "root") {
        throw new ApolloError(
          "You can not delete your Root folder",
          "CANT_DELETE_ROOT"
        );
      }
      if (existFolder) {
        if (existFolder.documentsID.length > 0) {
          for (const document of existFolder.documentsID) {
            await documentResolver.Mutation.deleteDocument(
              "",
              { id: document },
              context
            );
            await FolderModel.updateOne(
              { _id: existFolder.parent },
              { $pull: { documentsID: document } },
              { new: true }
            );
          }
        }
        if (existFolder.foldersID.length > 0) {
          for (const folder of existFolder.foldersID) {
            await folderResolver.Mutation.deleteFolder(
              "",
              { id: folder },
              context
            );
          }
        }
        await FolderModel.updateOne(
          { _id: existFolder.parent },
          { $pull: { foldersID: existFolder._id } },
          { new: true }
        );
        loggerController.storeInfoLog(
          "API",
          "space",
          "delete",
          "folder",
          existFolder.user,
          ""
        );
        return await FolderModel.deleteOne({ _id: args.id });
      } else {
        return new ApolloError("Folder does not exist", "FOLDER_NOT_FOUND");
      }
    },

    /**
     * Update folder: update existing folder.
     * It updates the folder with the new information provided.
     * args: folder ID, new folder information.
     */
    updateFolder: async (root: any, args: any, context: any) => {
      const existFolder: IFolder = await FolderModel.findOne({
        _id: args.id,
        user: context.user.userID
      });
      if (args.input.parent) {
        if (!(await FolderModel.findOne({ _id: args.input.parent }))) {
          throw new ApolloError(
            "Parent folder does not exist",
            "PARENT_NOT_FOUND"
          );
        }
      }
      if (!existFolder) {
        throw new ApolloError("Folder does not exist", "FOLDER_NOT_FOUND");
      }
      if (existFolder) {
        if (args.input.foldersID) {
          // si se pasa lista de carpetas hay que modificarlas para añadirlas el parent
          for (const folder of args.input.foldersID) {
            const fol: IFolder = await FolderModel.findOne({ _id: folder });
            if (!fol) {
              throw new ApolloError(
                "Folder ID does not exist",
                "FOLDER_NOT_FOUND"
              );
            }
            await FolderModel.updateOne(
              // quito la carpeta de la carpeta en la que estuviera
              { _id: fol.parent },
              { $pull: { foldersID: folder } },
              { new: true }
            );
            await FolderModel.updateOne(
              // actualizo la carpeta con el nuevo padre
              { _id: folder },
              { parent: existFolder._id }
            );
            await FolderModel.updateOne(
              { _id: existFolder._id },
              { $push: { foldersID: folder } }, // añado la nueva carpeta a los hijos de la carpeta
              { new: true }
            );
          }
        }
        if (args.input.documentsID) {
          // si se pasa lista de documentos hay que modificarlos para añadir la carpeta
          for (const document of args.input.documentsID) {
            const doc: IDocument = await DocumentModel.findOne({
              _id: document
            });
            if (!doc) {
              throw new ApolloError(
                "Document ID does not exist",
                "DOCUMENT_NOT_FOUND"
              );
            }
            await FolderModel.updateOne(
              // quito el documento de la carpeta en la que estuviera
              { _id: doc.folder },
              { $pull: { documentsID: document } },
              { new: true }
            );
            await DocumentModel.updateOne(
              // actualizo el documento con la nueva carpeta
              { _id: document },
              { folder: existFolder._id }
            );
            await FolderModel.updateOne(
              { _id: existFolder._id },
              { $push: { documentsID: document } }, // añado el nuevo document a los hijos de la carpeta
              { new: true }
            );
          }
        }
        if (args.input.parent && args.input.parent != existFolder.parent) {
          // si se pasa un nuevo parent hay que modificarlo para que tenga al hijo en la lista
          await FolderModel.updateOne(
            { _id: args.input.parent },
            { $push: { foldersID: existFolder._id } }
          );
          await FolderModel.updateOne(
            { _id: existFolder.parent },
            { $pull: { foldersID: existFolder._id } }
          );
        }
        if (existFolder.name == "root" && args.input.name) {
          throw new ApolloError(
            "You can not update your Root folder name",
            "CANT_UPDATE_ROOT"
          );
        }
        loggerController.storeInfoLog(
          "API",
          "space",
          "update",
          "folder",
          existFolder.user,
          ""
        );
        const updatedFolder: IFolder = await FolderModel.findOneAndUpdate(
          { _id: existFolder._id },
          {
            $set: {
              name: args.input.name || existFolder.name,
              parent: args.input.parent || existFolder.parent
            }
          },
          { new: true }
        );
        pubsub.publish(FOLDER_UPDATED, { folderUpdated: updatedFolder });
        return updatedFolder;
      } else {
        return new ApolloError("Folder does not exist", "FOLDER_NOT_FOUND");
      }
    },

    /**
     * duplicate folder
     */
    duplicateFolder: async (root: any, args: any, context: any) => {
      const existFolder: IFolder = await FolderModel.findOne({
        _id: args.id,
        user: context.user.userID
      });
      if (!existFolder) {
        throw new ApolloError("Folder does not exist", "FOLDER_NOT_FOUND");
      }
      const updatedFolder = await duplicateFolderChildren(
        existFolder,
        context.user.userID
      );
      pubsub.publish(FOLDER_UPDATED, { folderUpdated: updatedFolder });
      return updatedFolder;
    }
  },

  Query: {
    /**
     * Folders: returns all the folders of the user logged.
     * args: nothing.
     */
    folders: async (root: any, args: any, context: any) => {
      return FolderModel.find({ user: context.user.userID });
    },

    /**
     * Folder: returns the information of the folder ID provided in the arguments.
     * args: folder ID.
     */
    folder: async (root: any, args: any, context: any) => {
      const existFolder: IFolder = await FolderModel.findOne({
        _id: args.id,
        user: context.user.userID
      });
      if (!existFolder) {
        throw new ApolloError("Folder does not exist", "FOLDER_NOT_FOUND");
      }
      return existFolder;
    },

    /**
     * Root: returns the root folder of the user logged.
     * args: nothing.
     */
    rootFolder: async (root: any, args: any, context: any) => {
      return await FolderModel.findOne({
        name: "root",
        user: context.user.userID
      });
    }
  },

  Folder: {
    documents: async (folder: IFolder) =>
      DocumentModel.find({ folder: folder.id }),
    folders: async (folder: IFolder) => FolderModel.find({ parent: folder.id }),
    parentsPath: async (folder: IFolder) => {
      const result = getParentsPath(folder);
      console.log(result);
      return result;
    }
  }
};

export default folderResolver;
