namespace db;

using {managed} from '@sap/cds/common';
using { Attachments } from '@cap-js/sdm';

entity Request : managed {
    key RequestID : UUID @(Core.Computed: true);
    ProcessFlowAttachment : Composition of one Attachments;
}
