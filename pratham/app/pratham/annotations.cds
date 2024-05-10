using Account as service from '../../srv/Account';
annotate service.deptviews with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'name',
                Value : name,
            },
            {
                $Type : 'UI.DataField',
                Label : 'email',
                Value : email,
            },
            {
                $Type : 'UI.DataField',
                Label : 'description',
                Value : description,
            },
            {
                $Type : 'UI.DataField',
                Label : 'postalcode',
                Value : postalcode,
            },
            {
                $Type : 'UI.DataField',
                Label : 'createdDateTime',
                Value : createdDateTime,
            },
            {
                $Type : 'UI.DataField',
                Label : 'isDeleted',
                Value : isDeleted,
            },
            {
                $Type : 'UI.DataField',
                Label : 'applicationType',
                Value : applicationType,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'name',
            Value : name,
        },
        {
            $Type : 'UI.DataField',
            Label : 'email',
            Value : email,
        },
        {
            $Type : 'UI.DataField',
            Label : 'description',
            Value : description,
        },
        {
            $Type : 'UI.DataField',
            Label : 'postalcode',
            Value : postalcode,
        },
        {
            $Type : 'UI.DataField',
            Label : 'createdDateTime',
            Value : createdDateTime,
        },
    ],
);

