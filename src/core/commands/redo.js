import Command from "./base";
import { KEYBOARD_COMMANDS } from '../constants';

export class RedoCommand extends Command {
    static name = KEYBOARD_COMMANDS.REDO;
    exec() {
        this._editor.undoredo.redo();
    }
}