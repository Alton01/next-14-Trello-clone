"use client";

import { ListWithCards } from "@/types";
import { ListForm } from "./list-form";
import { useEffect, useState } from "react";
import { ListItem } from "./list-item";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { toast } from "sonner";
import { updateCardOrder } from "@/actions/update-card-order";

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
}

// FUNCTION FOR REORDERING ITEMS BY INDEXES

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}
//////////////////////////////////////////////////////////

export const ListContainer = ({ data, boardId }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);

  //FOR UPDATING LIST ORDER ON BROWSER REFRESH WITH API
  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success("List Reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  //FOR UPDATING CARD ORDER ON BROWSER REFRESH WITH API
  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("Card Reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  /////////////////////////////////////// FOR WHEN DATA UPDATES TO USE OPTIMISTIC UPDATE
  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    //DROPPED IN THE SAME POSITION
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    /// IF USER MOVES A LIST
    if (type === "list") {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );

      setOrderedData(items);
      executeUpdateListOrder({ items, boardId });
    }

    //IF USER MOVES A CARD
    if (type === "card") {
      let newOrderedData = [...orderedData];

      //SOURCE AND DESTINATION LIST
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destList) {
        return;
      }

      //IF CARDS PROPERTY DOES NOT EXIST ON SOURCE LIST
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      //CHECK IF CARDS EXIST ON DESTINATION LIST
      if (!destList.cards) {
        destList.cards = [];
      }

      //MOVING THE CARD IN THE SAME LIST
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );
        //CHANGE THE ORDER OF EACH CARDS
        reorderedCards.forEach((card, idx) => {
          card.order = idx;
        });

        sourceList.cards = reorderedCards;

        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: reorderedCards,
        });

        //IF USER MOVES THE CARD TO ANOTHER LIST
      } else {
        //REMOVE CARD FROM SOURCE LIST
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        //ASSIGN NEWLIST ID TO THE moved CARD
        movedCard.listId = destination.droppableId;

        //ADD CARD TO DESTINATION LIST
        destList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        //UPDATE THE ORDER FOR EACH CARD IN THE DESTINATION LIST
        destList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: destList.cards,
        });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => {
              return <ListItem key={list.id} index={index} data={list} />;
            })}
            {provided.placeholder}
            <ListForm />
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
