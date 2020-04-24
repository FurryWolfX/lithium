import React, { useEffect } from "react";
import "./App.css";

import "typeface-roboto";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/core/styles";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import GetAppIcon from "@material-ui/icons/GetApp";
import MinimizeIcon from "@material-ui/icons/Minimize";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import CloseIcon from "@material-ui/icons/Close";

import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import List from "@material-ui/core/List";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ExtensionIcon from "@material-ui/icons/Extension";

import Slider from "@material-ui/core/Slider";

import ThreeCanvas from "./ThreeComponents";

import * as API from "electron/api";

import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";

// eslint-disable-next-line no-eval
const { ipcRenderer } = eval("require('electron')");

const leftDrawerWidth = 250;
const rightDrawerWidth = 50;

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: { main: "#564b7e" },
    secondary: { main: "#786fb3" },
  },
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100%",
      display: "flex",
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    title: {
      flexGrow: 1,
      textAlign: "center",
    },
    leftDrawer: {
      width: leftDrawerWidth,
      flexShrink: 0,
    },
    leftDrawerPaper: {
      width: leftDrawerWidth,
    },
    rightDrawer: {
      width: rightDrawerWidth,
      flexShrink: 0,
    },
    rightDrawerPaper: {
      width: rightDrawerWidth,
      alignItems: "center",
    },
    slider: {
      margin: "22px",
      color: "#8d85bf",
    },
    sliderTrack: {
      height: 8,
      borderRadius: 4,
    },
    sliderRail: {
      height: 8,
      borderRadius: 4,
    },
    content: {
      width: "100%",
      height: "100%",
      display: "flex",
      overflowX: "hidden",
    },

    // Necessary for content to be below AppBar
    toolbar: theme.mixins.toolbar,
  })
);

function App() {
  const classes = useStyles();
  const [windowMaximized, setWindowMaximized] = React.useState<boolean>(false);
  const [clippingHeight, setClippingHeight] = React.useState<number>(0);
  const [items, setItems] = React.useState<API.Item[]>([]);
  const [maxHeight, setMaxHeight] = React.useState<number>(0);

  const handleChange = (event: any, sliderValue: number | number[]) => {
    setClippingHeight(sliderValue as number);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Delete") {
      deleteSelectedItems();
    }
  };

  const clickListItem = (item: API.Item, event: any) => {
    if (event.ctrlKey || event.shiftKey) {
      selectItem(item, true);
    } else {
      selectItem(item);
    }
  };

  const deleteSelectedItems = () => {
    var newItems: API.Item[] = [];

    items.forEach((item) => {
      if (!item.selected) {
        newItems.push(item);
      }
    });

    setMaxHeight(0);
    setClippingHeight(0);
    setItems([...newItems]);
  };

  const selectItem = (item?: API.Item, toggleSelection?: boolean) => {
    if (item) {
      if (toggleSelection) {
        item.selected = !item.selected;
      } else {
        items.forEach((item) => (item.selected = false));
        item.selected = true;
      }
    } else {
      items.forEach((item) => (item.selected = false));
    }

    setItems((items) => [...items]);
  };

  const updateHeight = (height: number) => {
    if (height > maxHeight) {
      setMaxHeight(height);
      setClippingHeight(height);
    }
  };

  useEffect(() => {
    ipcRenderer.on("window:maximize", function (e: any) {
      setWindowMaximized(true);
    });

    ipcRenderer.on("window:unmaximize", function (e: any) {
      setWindowMaximized(false);
    });

    ipcRenderer.on("item:add", function (e: any, item: API.Item) {
      item.selected = true;
      setItems((items) => [...items, item]);
    });
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={classes.root} onKeyDown={handleKeyDown}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton
              onClick={loadFile}
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="import"
            >
              <GetAppIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title} color="inherit">
              Lithium
            </Typography>
            <IconButton
              onClick={minimizeWindow}
              aria-label="minimize"
              color="inherit"
            >
              <MinimizeIcon />
            </IconButton>
            {!windowMaximized && (
              <IconButton
                onClick={maximizeWindow}
                aria-label="full screen"
                color="inherit"
              >
                <FullscreenIcon />
              </IconButton>
            )}
            {windowMaximized && (
              <IconButton
                onClick={unMaximizeWindow}
                aria-label="exit full screen"
                color="inherit"
              >
                <FullscreenExitIcon />
              </IconButton>
            )}
            <IconButton
              onClick={closeWindow}
              aria-label="close"
              edge="end"
              color="inherit"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.leftDrawer}
          variant="permanent"
          classes={{
            paper: classes.leftDrawerPaper,
          }}
        >
          <div className={classes.toolbar} />
          <List>
            {items.map((item) => (
              <MenuItem
                button
                key={item.uuid}
                selected={item.selected}
                onClick={(e) => clickListItem(item, e)}
              >
                <ListItemIcon>
                  <ExtensionIcon />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </MenuItem>
            ))}
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <ThreeCanvas
            items={items}
            heightUpdated={updateHeight}
            itemSelected={selectItem}
            clippingHeight={clippingHeight}
          />
        </main>
        <Drawer
          className={classes.rightDrawer}
          variant="permanent"
          classes={{
            paper: classes.rightDrawerPaper,
          }}
          anchor="right"
        >
          <div className={classes.toolbar} />
          <Slider
            className={classes.slider}
            orientation="vertical"
            value={clippingHeight}
            max={maxHeight}
            onChange={handleChange}
            aria-labelledby="continuous-slider"
          />
        </Drawer>
      </div>
    </ThemeProvider>
  );
}

function minimizeWindow() {
  ipcRenderer.send("window:minimize");
}

function maximizeWindow() {
  ipcRenderer.send("window:maximize");
}

function unMaximizeWindow() {
  ipcRenderer.send("window:unmaximize");
}

function closeWindow() {
  ipcRenderer.send("window:close");
}

function loadFile() {
  ipcRenderer.send("file:open");
}

export default App;
