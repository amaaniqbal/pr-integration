import ForgeUI, { 
    render,
    useProductContext,
    CustomField,
    CustomFieldEdit, 
    Text,
    TextField,
    UserPicker,
    Toggle, 
    Fragment, 
} from "@forge/ui";
import api from "@forge/api";

const View = () => {
    const {
        extensionContext: { fieldValue },
    } = useProductContext();

    return (
        <CustomField>
            <Text>
                {fieldValue || 'None'}
            </Text>
        </CustomField>
    );
};

const Edit = () => {
    const {
        platformContext: { issueKey }
    } = useProductContext();
      
    const sendEmailToQAOwner = async (qaOwner, notifyBody) => {
        const body = {
            htmlBody: notifyBody,
            subject: "A Pull Request Require Your QA!",
            to: {
                voters: true,
                watchers: true,
                groups: [
                    {
                        name: "jira-software-users"
                    }       
                ],
                reporter: true,
                assignee: false,
                users: [
                    {
                        accountId: qaOwner,
                    }
                ],
            },
            restrict: {
                permissions: [],
                groups: [],
            },
        };

        const response = await api
            .asUser()
            .requestJira(`/rest/api/3/issue/${issueKey}/notify`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            
        console.log(response);
    };
    
    const onSubmit = (formValue) => {        
        // Notify the QA Owner if one exists
        const wipText = formValue.isWIP ? "This PR is currently under development." : ""; 
        const notifyBody = `Pull Request for Ticket ${issueKey} is now available at ${formValue.prLink}. ${wipText}`;
        sendEmailToQAOwner(formValue.qaOwner, notifyBody);   

        return formValue.prLink;
    }

    return (
        <CustomFieldEdit onSubmit={onSubmit} header="Enter contribution details" width="medium" >
            <Fragment>
                <TextField label="Pull Request Link" name="prLink" isRequired />
                <UserPicker label="QA Owner" name="qaOwner" />
                <Toggle label="WIP?" name="isWIP" />
            </Fragment>
        </CustomFieldEdit>
    );
};

export const renderFieldView = render(<View />);
export const renderFieldEdit = render(<Edit />);
