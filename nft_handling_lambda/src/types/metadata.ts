export class Metadata {
    EventId: string;
    CorrelationId: string;
    Timestamp: string;

    constructor(eventId: string, correlationId: string, timestamp: string) {
        this.EventId = eventId;
        this.CorrelationId = correlationId;
        this.Timestamp = timestamp;
    }
}
