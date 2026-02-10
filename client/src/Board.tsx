import React, { cloneElement, isValidElement, ReactElement, useState } from "react";
import { Chessboard, defaultPieces } from "react-chessboard";
import { useDisclosure } from "@mantine/hooks";
import {
    charToRole,
    NormalMove,
    parseSquare,
    Role,
    ROLE_CHARS,
    RoleChar,
    Square,
    squareFile,
    SquareName,
    SquareSet,
    makeSquare
} from "chessops";
import { makeFen } from "chessops/fen";
import { produce } from "immer";

import { BoardState } from "./types/BoardState";
import { LLMS } from "./constants/llms";
import { playBoardSound } from "./lib/board-sounds";
import styles from "./Board.module.css";

type ColourChar = "w" | "b";
type Promotion = NormalMove & { colour: ColourChar };

function getRoleChars(colour: ColourChar, promotable = true) {
    return ROLE_CHARS
        .filter(char => !promotable || (char != "k" && char != "p"))
        .map(char => `${colour}${char.toUpperCase()}`);
}

interface BoardProps {
    onMovePlayed?: (move: NormalMove) => void;
    state: BoardState;
    pushState: (state: BoardState) => void;
}

function Board({ onMovePlayed, state, pushState }: BoardProps) {
    const [ highlighted, setHighlighted ] = useState<string[]>([]);
    const [ promotionOpen, promotionDialog ] = useDisclosure();
    const [ promotionMove, setPromotionMove ] = useState<Promotion>();

    const [ held, setHeld ] = useState<Square>();
    const [ hovered, setHovered ] = useState<Square>();

    const playMove = (move: NormalMove) => {
        const copy = state.position.clone();

        playBoardSound(copy, move);
        copy.play(move);
        onMovePlayed?.(move);
        pushState({
            position: copy,
            llms: produce(state.llms, draft => {
                const llm = draft[makeSquare(move.from)];
                delete draft[makeSquare(move.from)];

                if (!llm) return draft;
                draft[makeSquare(move.to)] = llm;
                return draft;
            })
        });
    };

    const handlePromotion = (piece: Role) => {
        if (!promotionMove) return;
        playMove({ ...promotionMove, promotion: piece });

        promotionDialog.close();
        setPromotionMove(undefined);
    };

    return <div className={styles.wrapper}>
        <Chessboard options={{
            position: makeFen(state.position.toSetup()),
            dragActivationDistance: 0,
            draggingPieceGhostStyle: { opacity: 0 },
            onMouseOverSquare: ({ square }) => {
                setHovered(parseSquare(square));
            },
            onMouseOutSquare: () => setHovered(undefined),
            onSquareRightClick: ({ square }) => {
                setHighlighted(prev => prev.includes(square)
                    ? prev.filter(sq => sq != square)
                    : [...prev, square]
                );
            },
            onSquareClick: () => {
                setHighlighted([]);
                promotionDialog.close();
            },
            onPieceDrag: ({ square }) => {
                setHeld(parseSquare(square as SquareName));

                setHighlighted([]);
                promotionDialog.close();
            },
            onPieceDrop: ({ piece, sourceSquare, targetSquare }) => {
                setHeld(undefined);

                const from = parseSquare(sourceSquare);
                const to = targetSquare && parseSquare(targetSquare);
                if (!from || !to) return false;

                const dests = state.position.dests(from);
                if (!dests.has(to)) return false;

                const move: NormalMove = { from, to };

                const backrankDests = dests.intersect(SquareSet.backranks());
                if (piece.pieceType.endsWith("P") && backrankDests.has(to)) {
                    promotionDialog.open();
                    setPromotionMove({
                        ...move,
                        colour: piece.pieceType.charAt(0) == "w" ? "w" : "b"
                    });
                    
                    return false;
                }

                playMove(move);
                return true;
            },
            squareRenderer: ({ square, children }) => {
                const parsedSquare = parseSquare(square as SquareName);
                const llm = state.llms[square as SquareName];

                const isDestination = held && state.position.dests(held)
                    .has(parsedSquare);
                const hasPiece = !!state.position.board.get(parsedSquare);
                
                return <div className={styles.square} style={{
                    backgroundColor: highlighted.includes(square)
                        ? "#eb6150cc" : undefined
                }}>
                    {isDestination && <div className={hasPiece
                        ? styles.captureDestCircle
                        : styles.destCircle
                    }/>}

                    {children}

                    {llm && <img
                        src={LLMS[llm].logo}
                        className={styles.llmLogo}
                        draggable={false}
                    />}

                    {llm && hovered == parsedSquare && <span
                        className={styles.llmName}
                    >
                        {LLMS[llm].name}
                    </span>}
                </div>;
            },
            boardStyle: { overflow: "visible" },
            dropSquareStyle: { boxShadow: "0 0 0px 5px #fff inset" }
        }}/>

        {promotionOpen && promotionMove && <div
            className={styles.promotionDialog}
            style={{
                top: promotionMove.colour == "w" ? 0 : "50%",
                left: `${squareFile(promotionMove.to) * 12.5}%`
            }}
        >
            {(promotionMove.colour == "w"
                ? getRoleChars(promotionMove.colour)
                : getRoleChars(promotionMove.colour).reverse()
            ).map(char => <div
                className={styles.promotionPiece}
                onClick={() => handlePromotion(
                    charToRole(char.charAt(1).toLowerCase() as RoleChar)
                )}
            >
                {defaultPieces[char]({ svgStyle: { width: "100%" } })}
            </div>)}
        </div>}
    </div>;
}

export default Board;