import { memo, useMemo } from "react";
import { defaultPieces } from "react-chessboard";

import { LLMS } from "@/constants/llms";
import styles from "./Piece.module.css";

interface PieceProps {
    roleChar: string;
    model: keyof typeof LLMS;
    tooltip: boolean;
}

const LLMIcon = memo(({ src }: { src: string }) => {
    return <img
        src={src}
        className={styles.llmLogo}
        draggable={false}
    />;
});

const Piece = memo(({ roleChar, model, tooltip }: PieceProps) => {
    const defaultSvg = useMemo(() => defaultPieces[roleChar](), [roleChar]);

    return <div>
        {defaultSvg}

        <LLMIcon src={LLMS[model].logo} />

        {tooltip && <span className={styles.llmName}>
            {LLMS[model].name}
        </span>}
    </div>;
});

export default Piece;