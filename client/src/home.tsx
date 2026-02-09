import { useState } from "react";
import { Button, Group } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { Chess } from "chessops";

import Board from "./Board";
import styles from "./home.module.css";

function Home() {
    const [ position, setPosition ] = useState(Chess.default());
    const [ posHistory, setPosHistory ] = useListState<Chess>([position]);

    return <div className={styles.wrapper}>
        <span className={styles.title}>
            AI Piece Chess
        </span>

        <Board position={position.clone()} setPosition={newPos => {
            setPosition(newPos);
            setPosHistory.append(newPos);
        }}/>

        <Group>
            <Button>
                Start Game
            </Button>

            <Button color="red" onClick={() => {
                const lastPosition = posHistory.at(-2);
                if (!lastPosition) return;

                setPosHistory.pop();
                setPosition(lastPosition);
            }}>
                Undo Move
            </Button>

            <Button color="red" onClick={() => {
                const defaultPosition = Chess.default();

                setPosHistory.setState([]);
                setPosition(defaultPosition);
            }}>
                Reset Game
            </Button>
        </Group>
    </div>;
}

export default Home;