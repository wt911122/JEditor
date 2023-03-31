/** 
 *  controlCallback(type, data);
 *  type: 
 *      
 * 
 * */

export function createInputElement(controlCallback) {
    const input = document.createElement('input');
    input.setAttribute('style',`
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        border:none;
        opacity: 0;
        z-index: -1;
        contain: strict;`);
    input.setAttribute('tabindex', -1);
    input.setAttribute('aria-hidden', true);
    input.setAttribute('spellcheck', false);
    input.setAttribute('autocorrect', 'off');

    let stopInput = false;
    let status = {
        ctrlOn: false,
    }

    input.addEventListener('beforeinput', e => {
        e.preventDefault();
        if(e.data) {
            if(!stopInput) {
                controlCallback('Input', e.data);
            }
        }
    })

    input.addEventListener('compositionstart', (e) => {
        controlCallback('compositionstart');
        stopInput = true;
    });
    input.addEventListener('compositionupdate', (e) => {
        controlCallback('compositionupdate', e.data);
    });
    input.addEventListener('compositionend', (e) => {
        controlCallback('compositionend', e.data);
        input.value = '';
        stopInput = false
    });

    input.addEventListener('keyup', (event) => {
        switch(event.key) {
            case "Shift":
                controlCallback("Shift", false);
                break;
            case "Meta":
            case "Control":
                status.ctrlOn = false;
                break;
            
        }
    })

    input.addEventListener('keydown', (event) => {
        switch(event.code) {
            case "Enter":
                controlCallback('Enter');
                break;
            case "Backspace":
                controlCallback('Backspace');
                break;
            case "ArrowLeft":
                controlCallback("ArrowLeft");
                break;
            case "ArrowRight":
                controlCallback("ArrowRight");
                break;
            case "ArrowDown":
                controlCallback("ArrowDown");
                break;
            case "ArrowUp":
                controlCallback("ArrowUp");
                break;
        }
        switch(event.key) {
            case "Shift":
                controlCallback("Shift", true);
                break;
            case "Meta":
            case "Control":
                status.ctrlOn = true;
                break;
            case 'a':
                if(status.ctrlOn) {
                    controlCallback('CtrlA');
                }
                break;
            case 'c':
                if(status.ctrlOn) {
                    controlCallback('CtrlC');
                }
                break; 
            case 'v':
                if(status.ctrlOn) {
                    controlCallback('CtrlV');
                }
                break;   
            case 'x':
                if(status.ctrlOn) {
                    controlCallback('CtrlX');
                }
            case 'z':
                if(status.ctrlOn) {
                    controlCallback('CtrlZ');
                }
            case 'y':
                if(status.ctrlOn) {
                    controlCallback('CtrlY');
                }
                break;
        }
    })
    return input;
}
