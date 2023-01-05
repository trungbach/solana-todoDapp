import { TODO_PROGRAM_PUBKEY } from "../constants"
import todoIDL from "../constants/todo.json"
import * as anchor from "@project-serum/anchor"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes"

export default class BaseTodoClass {
    constructor(connection, anchorWallet) {
        this.provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
        this.program = new anchor.Program(todoIDL, TODO_PROGRAM_PUBKEY, this.provider)
    }
}
