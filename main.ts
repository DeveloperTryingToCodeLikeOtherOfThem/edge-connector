enum PinFlags {
    Unused = 0,
    Digital = 0x0001,
    Analog = 0x0002,
    Input = 0x0004,
    Output = 0x0008,
    Touch = 0x0010
}

class Pin { 
    touched = false;
    value = 0;
    period = 0;
    servoAngle = 0;
    mode = PinFlags.Unused;
    pitch = false;
    pull = 0; // PullDown
    eventMode = 0;
    used: boolean = false;
    servoContinuous: boolean;

    constructor(public id: number) { }

    digitalReadPin(): number {
        this.mode = PinFlags.Digital | PinFlags.Input;
        return this.value > 100 ? 1 : 0;
    }

    digitalWritePin(value: number) {
        this.mode = PinFlags.Digital | PinFlags.Output;
        const v = this.value;
        this.value = value > 0 ? 1023 : 0;
    }

    setPull(pull: number) {
        this.pull = pull;
        switch (pull) {
            case 2 /*PinPullMode.PullDown*/: this.value = 0; break;
            case 1 /*PinPullMode.PullUp*/: this.value = 1023; break;
            default: this.value = Math.randomRange(0, 1023); break;
        }
    }

    analogReadPin(): number {
        this.mode = PinFlags.Analog | PinFlags.Input;
        return this.value || 0;
    }

    analogWritePin(value: number) {
        this.mode = PinFlags.Analog | PinFlags.Output;
        const v = this.value;
        this.value = Math.max(0, Math.min(1023, value));
    }

    analogSetPeriod(micros: number) {
        this.mode = PinFlags.Analog | PinFlags.Output;
        this.period = micros;
    }

    servoWritePin(value: number) {
        this.analogSetPeriod(20000);
        this.servoAngle = Math.max(0, Math.min(180, value));
    }

    servoSetContinuous(continuous: boolean) {
        this.servoContinuous = continuous;
    }

    isTouched(): boolean {
        this.mode = PinFlags.Touch | PinFlags.Analog | PinFlags.Input;
        return this.touched;
    }

    onEvent(ev: number, handler: () => void) {
        switch (ev) {
            case DAL.DEVICE_PIN_EVT_PULSE_HI:
            case DAL.DEVICE_PIN_EVT_PULSE_LO:
                this.eventMode = DAL.DEVICE_PIN_EVENT_ON_PULSE;
                break;
            case DAL.DEVICE_PIN_EVT_RISE:
            case DAL.DEVICE_PIN_EVT_FALL:
                this.eventMode = DAL.DEVICE_PIN_EVENT_ON_EDGE;
                break;
            default:
                return;
        }
        control.internalOnEvent(this.id, ev, handler);
    }
}