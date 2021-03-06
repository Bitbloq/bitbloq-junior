import React, { useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import styled from "@emotion/styled";
import { Icon } from "@bitbloq/ui";

export interface IArrowProps {
  direction: "decrement" | "increment";
  disabled: boolean;
  page: number;
  onClick: (page: number) => void;
}

const Arrow: React.FC<IArrowProps> = ({
  direction,
  disabled,
  page,
  onClick
}) => {
  const [changePage, setChangePage] = useState(true);
  const [{ isOver }, drop] = useDrop({
    accept: ["document", "folder"],
    collect: monitor => ({
      isOver: !!monitor.isOver()
    }),
    hover: () => {
      if (!disabled && changePage) {
        setChangePage(false);
        onClick(direction === "decrement" ? page - 1 : page + 1);
        setTimeout(setChangePage, 500, true);
      }
    }
  });

  return (
    <PageItem
      isOver={isOver}
      ref={drop}
      onClick={e =>
        disabled
          ? e.stopPropagation()
          : onClick(direction === "decrement" ? page - 1 : page + 1)
      }
    >
      <AngleIcon direction={direction} name="angle" />
    </PageItem>
  );
};

export interface IPageProps {
  page: number;
  onClick: (page: number) => void;
  selected: boolean;
}

const Page: React.FC<IPageProps> = ({ page, selected, onClick }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ["document", "folder"],
    canDrop: () => false,
    collect: monitor => ({
      isOver: !!monitor.isOver()
    }),
    hover: () => onClick(page)
  });

  return (
    <PageItem
      onClick={() => onClick(page)}
      selected={selected}
      ref={drop}
      isOver={isOver}
    >
      {page}
    </PageItem>
  );
};

export interface IPaginatorProps {
  className?: string;
  currentPage: number;
  pages: number;
  selectPage: (page: number) => void;
}

const Paginator: React.FC<IPaginatorProps> = ({
  className,
  currentPage,
  pages,
  selectPage
}) => {
  const preparePagesElements = (): JSX.Element[] => {
    const numberPages: Set<number> = new Set();

    numberPages.add(currentPage);

    for (let i = 1; i <= pages && numberPages.size < 7; i++) {
      if (currentPage - i > 0) {
        numberPages.add(currentPage - i);
      }
      if (currentPage + i <= pages) {
        numberPages.add(currentPage + i);
      }
    }

    numberPages.add(1);
    numberPages.add(pages);

    const pagesArray = Array.from(numberPages).sort((a, b) => a - b);

    return pagesArray.map((page, i) => (
      <React.Fragment key={i}>
        <Page
          page={page}
          selected={currentPage === page}
          onClick={selectPage}
        />
        {pagesArray[+i + 1] && pagesArray[+i + 1] - page > 1 && (
          <Ellipsis>
            <Icon name="ellipsis" />
          </Ellipsis>
        )}
      </React.Fragment>
    ));
  };

  const pagesElements = preparePagesElements();

  return (
    <DndProvider backend={HTML5Backend}>
      <PagesBar className={className}>
        <Arrow
          direction="decrement"
          disabled={currentPage === 1}
          page={currentPage}
          onClick={selectPage}
        />
        {pagesElements}
        <Arrow
          direction="increment"
          disabled={currentPage === pages}
          page={currentPage}
          onClick={selectPage}
        />
      </PagesBar>
    </DndProvider>
  );
};

export default Paginator;

interface IAngleIconProps {
  direction: "decrement" | "increment";
}
const AngleIcon = styled(Icon)<IAngleIconProps>`
  height: 12px;
  transform: rotate(
    ${props => (props.direction === "decrement" ? "90" : "-90")}deg
  );
  width: 12px;
`;

const Ellipsis = styled.div`
  align-items: flex-end;
  display: flex;
  height: 25px;
  margin-right: 10px;
  width: 10px;

  svg {
    width: 10px;
  }
`;

interface IPageItemProps {
  isOver?: boolean;
  selected?: boolean;
}
const PageItem = styled.div<IPageItemProps>`
  align-items: center;
  background-color: ${props => (props.selected ? "#eee" : "#fff")};
  border: solid 1px ${props => (props.isOver ? "#373b44" : "#ccc")};
  border-radius: 4px;
  color: #373b44;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  height: 32px;
  justify-content: center;
  margin-right: 10px;
  width: 32px;

  &:hover {
    background-color: #eee;
  }

  &:last-of-type {
    margin: 0;
  }
`;

const PagesBar = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;
