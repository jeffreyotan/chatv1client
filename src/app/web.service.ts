import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { Subject } from "rxjs";

export interface ChatMessage {
    from: string;
    message: string;
    timestamp: string;
}

@Injectable()
export class WebService {
    private sock: WebSocket = null;

    event = new Subject<ChatMessage>();

    sendMessage(msg) {
        console.info('-> Sending msg: ', msg);
        this.sock.send(msg);
    }

    join(name: string) {
        const params = new HttpParams().set('name', name);
        const url = `ws://localhost:3000/chat?${params.toString()}`;
        this.sock = new WebSocket(url);

        console.info(`-> Created WebSocket to ${url}`);
        // handle incoming messages
        this.sock.onmessage = (payload: MessageEvent) => {
            // parse the string to ChatMessage
            const chat = JSON.parse(payload.data) as ChatMessage;
            this.event.next(chat);
        };

        // handle accidental socket closure
        this.sock.onclose = () => {
            console.info('-> in function join.onclose with sock: ', this.sock);
            if(this.sock != null) {
                this.sock.close();
                this.sock = null;
            }
        };
    }

    leave() {
        console.info('-> Closing the WebSocket');
        if(this.sock != null) {
            console.info('-> Performing this.sock.close()');
            this.sock.close();
            this.sock = null;
            console.info('-> Completed this.sock.close()');
        }
    }
}