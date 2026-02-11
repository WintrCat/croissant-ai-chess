import { memo } from "react";
import { defaultPieces } from "react-chessboard";

import { LLMS } from "@/constants/llms";
import styles from "./Piece.module.css";

interface PieceProps {
    roleChar: string;
    model: keyof typeof LLMS;
    tooltip: boolean;
}

const Piece = memo(({ roleChar, model, tooltip }: PieceProps) => {
    const defaultSvg = defaultPieces[roleChar]();

    return <div>
        {defaultSvg}

        <img
            src={LLMS[model].logo}
            className={styles.llmLogo}
            draggable={false}
        />

        {tooltip && <span className={styles.llmName}>
            {LLMS[model].name}
        </span>}
    </div>;
});

export default Piece;