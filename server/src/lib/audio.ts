import { charToRole, Role } from "chessops";

// https://regex101.com/r/IegUOL/1
export const SAN_REGEX = new RegExp(
    "(?<role>[PNBRQK]?)[a-h]?[1-8]?[xX-]?(?<to>[a-h][1-8])"
    + "(?:=(?<promotion>[NBRQ])| ?e\.p\.)?|O-O(?:-O)?[+#$]?"
);

export function ttsMoveNotation(san: string) {
    if (san.includes("O-O-O")) return "Long castles";
    if (san.includes("O-O")) return "Short castles";

    const sanMatch = san.match(SAN_REGEX);
    if (!sanMatch) return san;

    const role: Role | undefined = sanMatch.groups?.["role"]
        ? charToRole(sanMatch.groups?.["role"])
        : "pawn";
    const toSquare = sanMatch.groups?.["to"];
    const promotion = sanMatch.groups?.["promotion"]
        ? charToRole(sanMatch.groups?.["promotion"])
        : undefined;
    if (!role || !toSquare) return san;

    const result: (string | undefined)[] = [
        role,
        san.includes("x") ? "takes" : undefined,
        toSquare
    ];

    result.push(promotion);
    if (san.includes("#")) result.push("checkmate");
    if (san.includes("+")) result.push("check");

    return result.filter(part => part != undefined).join(" ");
}