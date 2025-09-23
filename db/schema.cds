namespace db;

using {
    managed,
    cuid
} from '@sap/cds/common';


entity Request : managed {
    key RequestID  : UUID;
        fileName   : String;
        objectId   : String;
        folderId   : String;
        folderName : String;
        repository : String;
        _processes : Composition of many Process
                         on _processes.RequestID = $self.RequestID;
}

entity FileAttachment : managed, cuid {
    key RequestID    : UUID;
    key processId    : String;
        code         : String;
        path         : String;
        repository   : String;
        fileName     : String;
        objectId     : String;
        folderId     : String;
        parentId     : String;
        _parent      : Association to Request;
        isSubProcess : Boolean;
}

entity Process : managed, cuid {
    key RequestID          : UUID;
        files              : Composition of many FileAttachment
                                 on  files.RequestID = $self.RequestID
                                 and files.processId = $self.ID;
        isLinkedToCloudALM : Boolean;
        level              : String;
        code               : String;
        processName        : String;
}
