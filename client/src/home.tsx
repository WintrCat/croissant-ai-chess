import { Alert, Button, Group } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { Chess, makeSquare, NormalMove } from "chessops";
import { makeFen } from "chessops/fen";
import { produce } from "immer";

import { BoardState } from "./types/BoardState";
import { DEFAULT_PIECES } from "./constants/llms";
import Board from "./Board";
import styles from "./home.module.css";

const DEFAULT_STATE: BoardState = {
    position: Chess.default(),
    llms: DEFAULT_PIECES
};

function Home() {
    const [ stateHistory, setStateHistory ] = useListState([DEFAULT_STATE]);

    console.log(stateHistory.map(state => makeFen(state.position.toSetup())));

    const latestState = stateHistory.at(-1);
    if (!latestState) return <Alert color="red">
        Internal board error.
    </Alert>;

    const getOpinions = async (move?: NormalMove) => {
        const response = await fetch("/api/opinions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                position: makeFen(latestState.position.toSetup()),
                move: move,
                pieces: latestState.llms
            })
        });
    };

    return <div className={styles.wrapper}>
        <span className={styles.title}>
            AI Piece Chess
        </span>

        <Board
            onMovePlayed={move => {
                getOpinions();
            }}
            state={latestState}
            pushState={setStateHistory.append}
        />

        <span style={{ color: "white" }}>
            It is currently {latestState.position.turn} to move.
        </span>

        <Group>
            <Button onClick={() => getOpinions()}>
                Get AI Opinions
            </Button>

            <Button color="red" onClick={() => {
                const lastBoardState = stateHistory.at(-2);
                if (!lastBoardState) return;

                setStateHistory.pop();
            }}>
                Undo Move
            </Button>

            <Button color="red" onClick={() => {
                setStateHistory.setState([DEFAULT_STATE]);
            }}>
                Reset Game
            </Button>
        </Group>
    </div>;
}

export default Home;