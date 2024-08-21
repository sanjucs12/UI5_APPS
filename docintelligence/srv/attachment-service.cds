using btp.attachment as attachment from '../db/data-model';

service AttachmentServce {
    entity Attachments as select from attachment.ATTACHMENTS;
}
