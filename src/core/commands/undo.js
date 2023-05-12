import Command from "./base";
import { KEYBOARD_COMMANDS } from '../constants';

export class UndoCommand extends Command {
    static name = KEYBOARD_COMMANDS.UNDO;
    exec() {
        this._editor.undoredo.undo();
    }
}