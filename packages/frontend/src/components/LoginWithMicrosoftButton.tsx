import React, { FC } from "react";
import styled from "@emotion/styled";
import { Button } from "@bitbloq/ui";
import logoMicrosoftImage from "../images/logo-microsoft.svg";
import env from "../lib/env";

const appID = String(env.MICROSOFT_APP_ID);

const LoginWithMicrosoftButton: FC = () => {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const location = window.location;
    location.assign(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
      client_id=${appID}
      &response_type=code
      &redirect_uri=${encodeURIComponent(
        location.origin.concat("/microsoft-redirect")
      )}
      &response_mode=query
      &scope=User.Read
      &state=12345`);
  };

  return (
    <StyledButton quaternary onClick={onClick}>
      <Logo src={logoMicrosoftImage} alt="Microsoft" />
    </StyledButton>
  );
};

export default LoginWithMicrosoftButton;

/* Styled components */

const Logo = styled.img`
  height: 38px;
`;

const StyledButton = styled(Button)`
  width: 145px;
`;
