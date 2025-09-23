using {db as my} from '../db/schema';

service CapDMS @(requires: 'authenticated-user') {

entity RequestSet as projection on my.Request;
entity FileAttachmentSet as projection on my.FileAttachment;
entity ProcessSet as projection on my.Process;

    action uploadToDMS( @Core.MediaType: mediaType
                        content: LargeBinary,
                        @Core.IsMediaType: true
                        mediaType: String,
                        fileName: String) returns {
        isFileSaved      : Boolean;
        isProcessCreated : Boolean;
        message          : String;
    }


}
