import { charToRole, Role } from "chessops";

// https://regex101.com/r/IegUOL/1
export const SAN_REGEX = new RegExp(
    "(?<role>[PNBRQK]?)[a-h]?[1-8]?[xX-]?(?<to>[a-h][1-8])"
    + "(?:=(?<promotion>[NBRQ])| ?e\.p\.)?|O-O(?:-O)?[+#$]?"
);

// https://docs.fileformat.com/audio/wav/
export function pcmToWavDataURL(
    pcmData: Buffer,
    sampleRate = 24000,
    numChannels = 1,
    bitDepth = 16
) {
    // calculate sizes
    const blockAlign = numChannels * (bitDepth / 8);
    const byteRate = sampleRate * blockAlign;
    const fileSize = 36 + pcmData.length;

    // create WAV header (44 bytes)
    const header = Buffer.alloc(44);
    
    // RIFF chunk descriptor
    header.write("RIFF", 0);
    header.writeUInt32LE(fileSize, 4);
    header.write("WAVE", 8);
    
    // format stuff
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitDepth, 34);
    
    // length of everything
    header.write("data", 36);
    header.writeUInt32LE(pcmData.length, 40);
    
    const wavBuffer = Buffer.concat([ header, pcmData ]);

    return `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
}

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