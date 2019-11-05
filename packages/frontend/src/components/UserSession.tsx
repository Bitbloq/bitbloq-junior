import React from "react";
import styled from "@emotion/styled";
import { colors, DropDown, Icon, useTranslate } from "@bitbloq/ui";
import useUserData from "../lib/useUserData";
import useLogout from "../lib/useLogout";
import MenuButton from "./MenuButton";

const UserSession = () => {
  const logout = useLogout();
  const userData = useUserData();
  const t = useTranslate();

  return (
    <>
      <UserName>{userData && userData.name}</UserName>
      <UserAvatar src={userData ? userData.avatar : ""} />
      <DropDown>
        {(isOpen: boolean) => <MenuButton isOpen={isOpen} />}
        <ContextMenu>
          <ContextMenuOption>
            <Icon name="cloud-logo" />
            <p>{t("user.cloud.access")}</p>
          </ContextMenuOption>
          <ContextMenuOption onClick={() => logout()}>
            <p>{t("user.session.logout")}</p>
          </ContextMenuOption>
        </ContextMenu>
      </DropDown>
    </>
  );
};

export default UserSession;

/* styled components */

const UserName = styled.div`
  font-size: 14px;
`;

interface ImageProps {
  src: string;
}

const UserAvatar = styled.div<ImageProps>`
  background-color: ${colors.grayAvatar};
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  height: 40px;
  width: 40px;
`;

const ContextMenu = styled.div`
  background-color: white;
  margin-top: 6px;
  box-shadow: 0 3px 7px 0 rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  border: solid 1px #cfcfcf;
`;

const ContextMenuOption = styled.div`
  align-items: center;
  border-bottom: 1px solid #ebebeb;
  cursor: pointer;
  display: flex;
  padding: 10px 14px 9px;

  p {
    font-size: 14px;
    height: 16px;
  }

  svg {
    margin-right: 10px;
  }

  &:hover {
    background-color: #ebebeb;
  }

  &:last-child {
    border: none;
  }
`;
