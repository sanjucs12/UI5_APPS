namespace Pratham;

// Account [SUPER-USER]
entity DepartmentView {
    key id              : UUID;
        name            : String;
        email           : String;
        description     : String;
        postalcode      : String;
        createdDateTime : Date;
        isDeleted       : Boolean;
        applicationType : String;

}

entity Department {
    key id              : UUID;
        name            : String;
        email           : String;
        phone           : String;
        isActive        : Boolean;
        description     : String;
        isDeleted       : Boolean;
        createdDateTime : DateTime;
        mapType         : String;
        applicationType : String;
        postalcode      : String;
        isQUAssigned    : Boolean;
        isSteelQU       : Boolean;
        isMdpeQU        : Boolean;
        settings        : {
            isAccountLockEnabled : Boolean;
        };
}
