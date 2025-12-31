import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { ChatService, ChatMessage, ChatParticipant } from '../../core/services/chat.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-collaboration-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  template: `
    <div class="chat-container" [class.expanded]="isExpanded">
      <!-- Chat Header -->
      <div class="chat-header" (click)="toggleExpand()">
        <div class="header-left">
          <mat-icon>chat</mat-icon>
          <span class="title">Team Chat</span>
          <span class="participant-count" *ngIf="participants.length > 0">
            {{ participants.length }} members
          </span>
        </div>
        <div class="header-right">
          <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          <mat-icon class="expand-icon">{{ isExpanded ? 'expand_more' : 'expand_less' }}</mat-icon>
        </div>
      </div>

      <!-- Chat Body -->
      <div class="chat-body" *ngIf="isExpanded">
        <!-- Participants -->
        <div class="participants-bar">
          <div class="participant-avatars">
            <div class="avatar" *ngFor="let p of participants.slice(0, 5)" [matTooltip]="p.name">
              {{ p.name.charAt(0).toUpperCase() }}
            </div>
            <div class="avatar more" *ngIf="participants.length > 5">
              +{{ participants.length - 5 }}
            </div>
          </div>
          <span class="typing-indicator" *ngIf="typingUsers.length > 0">
            {{ getTypingText() }}
          </span>
        </div>

        <!-- Messages -->
        <div class="messages-container" #messagesContainer>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner diameter="30"></mat-spinner>
          </div>

          <div *ngIf="!loading && messages.length === 0" class="empty-chat">
            <mat-icon>forum</mat-icon>
            <p>No messages yet. Start the conversation!</p>
          </div>

          <div class="message-list">
            <div *ngFor="let msg of messages; let i = index" 
                 class="message" 
                 [class.own]="msg.user_id === currentUserId"
                 [class.same-sender]="i > 0 && messages[i-1].user_id === msg.user_id">
              
              <div class="message-avatar" *ngIf="msg.user_id !== currentUserId && (i === 0 || messages[i-1].user_id !== msg.user_id)">
                {{ msg.user_name ? msg.user_name.charAt(0).toUpperCase() : '?' }}
              </div>
              
              <div class="message-content">
                <div class="message-header" *ngIf="msg.user_id !== currentUserId && (i === 0 || messages[i-1].user_id !== msg.user_id)">
                  <span class="sender-name">{{ msg.user_name }}</span>
                </div>
                <div class="message-bubble">
                  <p>{{ msg.message }}</p>
                  <span class="message-time">{{ msg.created_at | date:'shortTime' }}</span>
                </div>
              </div>

              <button mat-icon-button class="delete-btn" 
                      *ngIf="msg.user_id === currentUserId"
                      [matMenuTriggerFor]="messageMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #messageMenu="matMenu">
                <button mat-menu-item (click)="deleteMessage(msg)">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <input 
            [(ngModel)]="newMessage" 
            (keyup.enter)="sendMessage()"
            (input)="onTyping()"
            placeholder="Type a message..."
            [disabled]="sending">
          <button mat-icon-button color="primary" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      z-index: 1000;
      transition: all 0.3s ease;

      &.expanded {
        height: 500px;
      }
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          font-size: 24px;
        }

        .title {
          font-weight: 600;
        }

        .participant-count {
          font-size: 0.8rem;
          opacity: 0.8;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .unread-badge {
          background: #f44336;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }
      }
    }

    .chat-body {
      display: flex;
      flex-direction: column;
      height: calc(100% - 52px);
    }

    .participants-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f5f5f5;
      border-bottom: 1px solid #eee;

      .participant-avatars {
        display: flex;
        gap: -8px;

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          border: 2px solid white;
          margin-left: -8px;

          &:first-child {
            margin-left: 0;
          }

          &.more {
            background: #9e9e9e;
            font-size: 0.65rem;
          }
        }
      }

      .typing-indicator {
        font-size: 0.75rem;
        color: #666;
        font-style: italic;
      }
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      background: #fafafa;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .empty-chat {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9e9e9e;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
      }

      p {
        font-size: 0.9rem;
      }
    }

    .message-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .message {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      max-width: 85%;

      &.own {
        flex-direction: row-reverse;
        margin-left: auto;

        .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 16px 16px 4px 16px;

          .message-time {
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }

      &.same-sender {
        .message-avatar {
          visibility: hidden;
        }
      }
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .message-content {
      display: flex;
      flex-direction: column;

      .message-header {
        margin-bottom: 2px;
        margin-left: 12px;

        .sender-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
        }
      }
    }

    .message-bubble {
      background: white;
      padding: 8px 12px;
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

      p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
        word-wrap: break-word;
      }

      .message-time {
        display: block;
        font-size: 0.65rem;
        color: #999;
        text-align: right;
        margin-top: 4px;
      }
    }

    .delete-btn {
      opacity: 0;
      transition: opacity 0.2s;
    }

    .message:hover .delete-btn {
      opacity: 1;
    }

    .chat-input {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #eee;
      background: white;

      input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
          border-color: #667eea;
        }
      }

      button {
        flex-shrink: 0;
      }
    }
  `]
})
export class CollaborationChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() itineraryId!: number;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  participants: ChatParticipant[] = [];
  typingUsers: { userId: number; userName: string }[] = [];

  newMessage = '';
  loading = true;
  sending = false;
  isExpanded = false;
  unreadCount = 0;
  currentUserId: number;

  private subscriptions: Subscription[] = [];
  private typingTimeout: any;
  private shouldScrollToBottom = true;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.currentUserId = this.authService.getCurrentUser()?.id || 0;
  }

  ngOnInit(): void {
    this.loadMessages();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.socketService.leaveChat(this.itineraryId);
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  loadMessages(): void {
    this.loading = true;
    this.chatService.getChatMessages(this.itineraryId).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.participants = response.participants;
        this.loading = false;
        this.shouldScrollToBottom = true;
        
        // Join socket room
        this.socketService.joinChat(this.itineraryId);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load chat', 'Close', { duration: 3000 });
      }
    });
  }

  setupSocketListeners(): void {
    // Listen for new messages
    this.subscriptions.push(
      this.socketService.onChatMessage().subscribe(message => {
        if (message.itinerary_id === this.itineraryId) {
          this.messages.push(message);
          this.shouldScrollToBottom = true;
          
          if (!this.isExpanded && message.user_id !== this.currentUserId) {
            this.unreadCount++;
          }
        }
      })
    );

    // Listen for message deletions
    this.subscriptions.push(
      this.socketService.onChatMessageDeleted().subscribe(data => {
        if (data.itineraryId === this.itineraryId) {
          this.messages = this.messages.filter(m => m.id !== data.messageId);
        }
      })
    );

    // Listen for typing indicators
    this.subscriptions.push(
      this.socketService.onUserTyping().subscribe(data => {
        if (data.userId !== this.currentUserId) {
          if (data.isTyping) {
            if (!this.typingUsers.find(u => u.userId === data.userId)) {
              this.typingUsers.push({ userId: data.userId, userName: data.userName });
            }
          } else {
            this.typingUsers = this.typingUsers.filter(u => u.userId !== data.userId);
          }
        }
      })
    );
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.sending) return;

    this.sending = true;
    const message = this.newMessage.trim();
    this.newMessage = '';

    this.chatService.sendChatMessage(this.itineraryId, message).subscribe({
      next: () => {
        this.sending = false;
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.sending = false;
        this.newMessage = message; // Restore message on error
        this.snackBar.open('Failed to send message', 'Close', { duration: 3000 });
      }
    });
  }

  deleteMessage(msg: ChatMessage): void {
    this.chatService.deleteChatMessage(msg.id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== msg.id);
      },
      error: () => {
        this.snackBar.open('Failed to delete message', 'Close', { duration: 3000 });
      }
    });
  }

  onTyping(): void {
    this.socketService.sendTyping(this.itineraryId, true);
    
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.socketService.sendTyping(this.itineraryId, false);
    }, 2000);
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.unreadCount = 0;
      this.shouldScrollToBottom = true;
    }
  }

  getTypingText(): string {
    if (this.typingUsers.length === 1) {
      return `${this.typingUsers[0].userName} is typing...`;
    } else if (this.typingUsers.length === 2) {
      return `${this.typingUsers[0].userName} and ${this.typingUsers[1].userName} are typing...`;
    } else if (this.typingUsers.length > 2) {
      return 'Several people are typing...';
    }
    return '';
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        this.shouldScrollToBottom = false;
      }
    } catch (err) {}
  }
}
