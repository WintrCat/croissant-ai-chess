import React, { useState } from "react";
import { Chessboard, defaultPieces, PieceRenderObject } from "react-chessboard";
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

import Piece from "../Piece";
import { BoardState } from "../../types/BoardState";
import { LLMS } from "../../constants/llms";
import { playBoardSound } from "../../lib/board-sounds";
import styles from "./Board.module.css";

type ColourChar = "w" | "b";
type Promotion = NormalMove & { colour: ColourChar };

function getRoleChars(colour?: ColourChar, promotable = true) {
    const colourRoleChars = (colour: ColourChar) => ROLE_CHARS
        .filter(char => !promotable || (char != "k" && char != "p"))
        .map(char => `${colour}${char.toUpperCase()}`);

    return colour
        ? colourRoleChars(colour)
        : colourRoleChars("w").concat(colourRoleChars("b"));
}

interface BoardProps {
    onMovePlayed?: (move: NormalMove) => void;
    state: BoardState;
    pushState: (state: BoardState) => void;
    options: {
        llmTooltips?: boolean;
    }
}

function Board({ onMovePlayed, state, pushState, options }: BoardProps) {
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
            }),
            move: move
        });
    };

    const handlePromotion = (piece: Role) => {
        if (!promotionMove) return;
        playMove({ ...promotionMove, promotion: piece });

        promotionDialog.close();
        setPromotionMove(undefined);
    };

    const pieces: PieceRenderObject = Object.fromEntries(
        getRoleChars(undefined, false).map(char => [char, piece => {
            const defaultSvg = defaultPieces[char]();
            if (!piece?.square) return defaultSvg;

            const llm = state.llms[piece.square as SquareName];
            if (!llm) return defaultSvg;

            const parsedSquare = parseSquare(piece.square);

            return <Piece roleChar={char} model={llm} tooltip={!!(
                (held == parsedSquare || (
                    held == undefined && hovered == parsedSquare
                ))
                && options.llmTooltips
            )}/>;
        }])
    );

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
                </div>;
            },
            pieces: pieces,
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