/**
 * Communication Components -- Barrel Export
 *
 * All shared communication components for Vibe Engine app templates.
 * Import from 'src/shared/communication' in any template.
 */

// CMM-01: ContactForm
export { default as ContactForm } from './ContactForm';
export type { ContactFormConfig } from './ContactForm';

// CMM-02: EmailComposer
export { default as EmailComposer } from './EmailComposer';
export type { EmailComposerConfig, EmailData, EmailTemplate, EmailAttachment } from './EmailComposer';

// CMM-03: ChatWidget
export { default as ChatWidget } from './ChatWidget';
export type { ChatWidgetConfig, ChatMessage } from './ChatWidget';

// CMM-04: NotificationCenter
export { default as NotificationCenter } from './NotificationCenter';
export type { NotificationCenterConfig, Notification } from './NotificationCenter';

// CMM-05: CommentThread
export { default as CommentThread } from './CommentThread';
export type { CommentThreadConfig, Comment, CommentReply, CommentAuthor } from './CommentThread';

// CMM-06: RSVPForm
export { default as RSVPForm } from './RSVPForm';
export type { RSVPFormConfig, RSVPData } from './RSVPForm';

// CMM-07: SocialShareBar
export { default as SocialShareBar } from './SocialShareBar';
export type { SocialShareBarConfig } from './SocialShareBar';
