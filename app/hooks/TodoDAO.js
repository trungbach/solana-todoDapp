import * as anchor from "@project-serum/anchor"
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { SystemProgram } from "@solana/web3.js"
import { TODO_PROGRAM_PUBKEY } from "../constants"
import todoIDL from "../constants/todo.json"
import { authorFilter } from "../utils"

export default class TodoDAO {
    constructor(connection, anchorWallet) {
        this.provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions())
        this.program = new anchor.Program(todoIDL, TODO_PROGRAM_PUBKEY, this.provider)
    }

    async initializeUser(authority, userProfile) {
        const transaction = await this.program.methods
            .initializeUser()
            .accounts({
                authority,
                userProfile,
                systemProgram: SystemProgram.programId,
            })
            .rpc()
        return transaction
    }

    async addTodo(authority, userProfile, todoAccount, content) {
        const transaction = await this.program.methods
            .addTodo(content)
            .accounts({
                authority,
                userProfile,
                todoAccount,
                systemProgram: SystemProgram.programId,
            })
            .rpc()
        return transaction
    }

    async markTodo(authority, userProfile, todoAccount, todoID) {
        const transaction = await this.program.methods
            .markTodo(todoID)
            .accounts({
                authority,
                userProfile,
                todoAccount,
                systemProgram: SystemProgram.programId,
            })
            .rpc()
        return transaction
    }

    async removeTodo(authority, userProfile, todoAccount, todoID) {
        const transaction = await this.program.methods
            .removeTodo(todoID)
            .accounts({
                authority,
                userProfile,
                todoAccount,
                systemProgram: SystemProgram.programId,
            })
            .rpc()
        return transaction
    }

    async getUserProfile(profilePda) {
        const userProfile = await this.program.account.userProfile.fetch(profilePda)
        return userProfile
    }

    async getTodoAccount(publicKey) {
        const todoAccounts = await this.program.account.todoAccount.all([authorFilter(publicKey.toString())])
        return todoAccounts
    }

    findProgramAddress(seedTag, publicKey, lastTodoIndex) {
        const [profilePda, profileBump] =
            lastTodoIndex != undefined
                ? findProgramAddressSync(
                      [utf8.encode(seedTag), publicKey.toBuffer(), Uint8Array.from([lastTodoIndex])],
                      this.program.programId
                  )
                : findProgramAddressSync([utf8.encode(seedTag), publicKey.toBuffer()], this.program.programId)
        return [profilePda, profileBump]
    }
}
