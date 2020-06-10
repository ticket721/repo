import React            from 'react';
import * as yup         from 'yup';
import MuiAppBar           from '@material-ui/core/AppBar';
import MuiTabs          from '@material-ui/core/Tabs';
import Tab              from '@material-ui/core/Tab';
import Box              from '@material-ui/core/Box';
import Button           from '@frontend/flib-react/lib/components/button';
import styled           from 'styled-components';
import { useFormik }    from 'formik';
import * as validators  from './validators';
import Global           from './Global';
import CustomCategories           from './CustomCategories';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const ticketsSchema = yup.object().shape({
    global: validators.global,
    dates: validators.dates,
});
type FormValues = yup.InferType<typeof ticketsSchema>;

const initialValues: FormValues = {
    global: [
        {
            name: '',
            price: 0,
            quantity: 0,
            salesStart: new Date(),
            salesEnd: new Date(),
            resalesStart: new Date(),
            resalesEnd: new Date(),
            resales: false,
        }
    ],
    dates: [{
        name: '',
        dates: [],
    }],
};

function CategorizeTicketsForm() {
    const [value, setValue] = React.useState(0);
    const [validationGlobal, setValidationGlobal] = React.useState(['false']);
    const [validationDates, setValidationDates] = React.useState(['false']);


    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };
    const formik = useFormik({
        initialValues,
        onSubmit: values => {
            alert(JSON.stringify(values, null, 2));
        },
        validationSchema: ticketsSchema
    });

    return (
        <>
            <AppBar position='static'>
                <Tabs value={value} onChange={handleChange} aria-label='from tabs'>
                    <Tab label='Global Passes' {...a11yProps(0)} />
                    <Tab label='Tickets' {...a11yProps(1)} />
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                <Global
                    formik={formik}
                    validation={validationGlobal}
                    setValidation={setValidationGlobal}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <CustomCategories
                    formik={formik}
                    validation={validationDates}
                    setValidation={setValidationDates}
                />
            </TabPanel>
            <Button variant='primary' type='submit' title='Validate'/>
        </>
    );
}

const Tabs = styled(MuiTabs)`
  && {
    color: ${(props) => props.theme.textColor};
    span {
      font-size: 11px;
      font-weight: bold;
    }
  }
`;

const AppBar = styled(MuiAppBar)`
  && {
    background-color: transparent;
    div > div > span {
      background-color: ${(props) => props.theme.primaryColor.hex};
    }
  }
`;

export default CategorizeTicketsForm;
