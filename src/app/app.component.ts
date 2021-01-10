import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebService } from './web.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title: string = 'chat';
  nameForm: FormGroup;
  msgForm: FormGroup;

  connectAction: string = '';

  messages = [];
  event$: Subscription;

  constructor(private fb: FormBuilder, private webSvc: WebService) {}

  ngOnInit() {
    this.nameForm = this.fb.group({
      username: this.fb.control('', [ Validators.required ])
    });

    this.msgForm = this.fb.group({
      message: this.fb.control('', [ Validators.required ])
    });

    this.connectAction = "Connect";
  }

  ngOnDestroy() {
    // check if we are connected befoe unsubscribing
    if(this.event$ != null) {
      this.event$.unsubscribe();
      this.event$ = null;
    }
  }

  onClickConnect() {
    const username = this.nameForm.get("username").value;
    console.info('-> We got username: ', username);
    this.nameForm.get("username").reset();
    
    if(this.connectAction === "Connect") {
      this.connectAction = "Leave";
      this.webSvc.join(username);
      // subscribe to incoming messages
      this.event$ = this.webSvc.event.subscribe(
        (chat) => {
          this.messages.unshift(chat);
        }
      )
      console.info('-> Successfully created WebSocket for ', username);
    } else {
      this.connectAction = "Connect";
      this.webSvc.leave();
      this.event$.unsubscribe();
      this.event$ = null;
      console.info('-> Successfully closed the WebSocket');
    }
  }

  onClickSend() {
    const message = this.msgForm.get("message").value;
    console.info('-> We got message: ', message);
    this.msgForm.get("message").reset();

    this.webSvc.sendMessage(message);
  }
}
