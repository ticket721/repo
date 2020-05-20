import React  from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs   from '@material-ui/core/Tabs';
import Tab    from '@material-ui/core/Tab';
import Box    from '@material-ui/core/Box';
import Button from '@frontend/flib-react/lib/components/button';
import styled from 'styled-components';

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

function CategorizeTicketsForm() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position='static'>
        <Tabs value={value} onChange={handleChange} aria-label='simple tabs example'>
          <Tab label='Global Passes' {...a11yProps(0)} />
          <Tab label='Tickets' {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Text>Informations</Text>
      </TabPanel>
      <TabPanel value={value} index={1}>
        Custom Tickets...
      </TabPanel>
      <Button variant='primary' type='submit' title='Validate'/>
    </>
  );
}

const Text = styled.h2``;

export default CategorizeTicketsForm;
