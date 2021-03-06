import React, { FC, useState, useEffect } from "react";
import styled from "@emotion/styled";
import update from "immutability-helper";
import { Icon, JuniorSwitch, MelodyEditor, useTranslate } from "@bitbloq/ui";
import BalloonPanel from "../BalloonPanel";

import { IBloq, IExtraData, IMelody } from "../../index";

import Music1Icon from "./icons/music1.svg";
import Music2Icon from "./icons/music2.svg";
import Music3Icon from "./icons/music3.svg";
import MusicStopIcon from "./icons/music-stop.svg";

interface IMusicConfigurationProps {
  bloq: IBloq;
  onChange: (newBloq: IBloq) => any;
  extraData?: IExtraData;
  onExtraDataChange?: (extraData: IExtraData) => void;
}

const defaultMelody: IMelody = Array(6).fill({ duration: 2, note: "" });

const MusicConfiguration: FC<IMusicConfigurationProps> = ({
  bloq,
  onChange,
  extraData = {},
  onExtraDataChange
}) => {
  const t = useTranslate();
  const melodyIndex = (bloq.parameters.melodyIndex as string) || "0";
  const melodies = extraData && extraData.melodies;
  const [melody, setMelody] = useState<IMelody>(defaultMelody);

  useEffect(() => {
    if (melodies && melodies[melodyIndex]) {
      setMelody(melodies[melodyIndex]);
    } else {
      setMelody(defaultMelody);
    }
  }, [melodies, melodyIndex]);

  return (
    <Container>
      <SwitchWrap>
        <JuniorSwitch
          buttons={[
            { content: <ButtonIcon src={Music1Icon} />, id: "0" },
            { content: <ButtonIcon src={Music2Icon} />, id: "1" },
            { content: <ButtonIcon src={Music3Icon} />, id: "2" },
            { content: <ButtonIcon src={MusicStopIcon} />, id: "stop" }
          ]}
          value={melodyIndex}
          onChange={newValue =>
            onChange(
              update(bloq, { parameters: { melodyIndex: { $set: newValue } } })
            )
          }
        />
      </SwitchWrap>
      {melodyIndex !== "stop" && (
        <MelodyEditor
          key={melodyIndex}
          notes={melody}
          onChange={notes => {
            setMelody(notes);
            if (!onExtraDataChange) {
              return;
            }
            const newMelodies = [...(extraData.melodies || [])];
            newMelodies[melodyIndex] = notes;
            onExtraDataChange({ ...extraData, melodies: newMelodies });
          }}
          noteLabels={{
            NOTE_C4: t("music.NOTE_C4"),
            NOTE_D4: t("music.NOTE_D4"),
            NOTE_E4: t("music.NOTE_E4"),
            NOTE_F4: t("music.NOTE_F4"),
            NOTE_G4: t("music.NOTE_G4"),
            NOTE_A4: t("music.NOTE_A4"),
            NOTE_B4: t("music.NOTE_B4"),
            NOTE_C5: t("music.NOTE_C5"),
            NOTE_D5: t("music.NOTE_D5")
          }}
        />
      )}
    </Container>
  );
};

export default MusicConfiguration;

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex: 1;
  width: 100%;
  overflow: hidden;
  justify-content: center;
`;

const SwitchWrap = styled.div`
  margin-right: 12px;
`;

const ImageWrap = styled(BalloonPanel)`
  height: 150px;
  padding: 0px 55px;
  display: flex;
  align-items: center;
`;

const ButtonIcon = styled.img`
  width: 36px;
`;
