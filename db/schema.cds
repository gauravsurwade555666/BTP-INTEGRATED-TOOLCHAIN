namespace db;

using {
    managed,
    cuid
} from '@sap/cds/common';


entity Request : managed {
    key RequestID   : UUID;
        process     : String;
        processFile : Composition of one FileAttachment
                          on  processFile.RequestID = $self.RequestID
                          and processFile.process   = $self.process;

        _processes  : Composition of many Process
                          on _processes.RequestID = $self.RequestID;
}

entity FileAttachment : managed, cuid {
    key RequestID    : UUID;
    key process      : String;
        code         : String;
        path         : String;
        repository   : String;
        fileName     : String;
        objectId     : String;
        folderId     : String;
        _parent      : Association to Request;
        isSubProcess : Boolean;
}

entity Process : managed, cuid {
    key RequestID          : UUID;
        _parent            : Association to Request;
        files              : Composition of many FileAttachment
                                 on  files.RequestID = $self.RequestID
                                 and files.process   = $self.processName;
        isLinkedToCloudALM : Boolean;
        level              : String;
        code               : String;
        processName        : String;

}
