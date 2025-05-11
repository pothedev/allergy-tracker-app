import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorMap, translation } from '../data';
import { ScrollView } from 'react-native-gesture-handler';
import StorageContext from '../pages/StorageContext';
import { TextInput } from 'react-native-gesture-handler';

import { auth, db} from "../firebaseConfig";
import { signOut, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useSafeArea } from 'native-base';



async function reauthenticateUser(email: string, password: string): Promise<"success" | "invalid-password" | "other-error"> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently logged in.");

    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);

    console.log("✅ Re-authentication successful");
    return "success";
  } catch (error: any) {
    console.error("❌ Re-authentication failed:", error.message);

    if (error.code === "auth/invalid-credential") {
      return "invalid-password";
    }

    return "other-error";
  }
}


async function deleteAccount(setLoggedIn: any, tempPassword:string, setPasswordError:any) {
  try {
    const user = auth.currentUser;

    if (!user) throw new Error("No user is currently logged in.");

    const confirmed = await reauthenticateUser(user.email, tempPassword)

    if (!confirmed) {
      console.warn("❌ Reauthentication failed. Aborting account deletion.");
      return;
    }

    

    const uid = user.uid;
    try{
      await deleteDoc(doc(db, "users", uid));
    }
    catch (error: any) {
      console.log("❌ Couldnt delete user document. Firebase error:", error)
    }

    await user.delete();
    
    await AsyncStorage.clear();
    setLoggedIn(false);
    console.log("✅ Account successfully deleted.");
  } catch (error: any) {
    if (error.code === "auth/requires-recent-login") {
      console.warn("⚠️ Re-authentication required. Please ask the user to log in again.");
      setPasswordError(true)
      // Optionally redirect to Login for re-authentication
    } else {
      console.error("❌ Failed to delete account:", error.message);
    }
  }
}


async function logOut(setLoggedIn: any) {
  try {
    await signOut(auth); // ✅ Firebase session cleared

    await AsyncStorage.clear(); // ✅ Local data cleared

    setTimeout(() => {
      setLoggedIn(false); // ✅ UI state updated
      console.log("✅ Logged out successfully.");
    }, 100);
  } catch (error: any) {
    console.error("❌ Failed to log out:", error.message);
  }
}

const DeletePanel: React.FC<{
  theme: string;
  language: string;
  setLoggedIn: (value: boolean) => void;
  setPressedDelete: (value: boolean) => void;
}> = ({ theme, language, setLoggedIn, setPressedDelete}) => {
  
  const translate = (key: string): string => translation[language]?.[key] || key;
  const [tempPassword, setTempPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState<boolean>(false)
  
  return (
    <View style={[styles.deletePanel, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <Text style={[{color: colorMap[theme+"Text"], fontSize: 18, fontWeight: 'semibold', textAlign: "center", marginBottom: 30}]}>{translate("Are you sure you want to delete your account?")}</Text>
      <Text style={[{color: colorMap[theme+"Text2"], fontSize: 14, marginBottom: 20}]}>{translate("Your data will be deleted")}</Text>
      <Text style={[{color: colorMap[theme+"Text"], fontSize: 14}]}>{translate("Enter your password")}</Text>
      <View style={{flexDirection: 'row', width: '100%', alignItems: "center", marginTop: 12,}}>
        <TextInput
          value={tempPassword}
          onChangeText={setTempPassword}
          secureTextEntry={!showPassword}
          style={[styles.settingText, {
            color: colorMap[theme + "Text2"],
            padding: 5,
            backgroundColor: colorMap[theme+"Widget3"],
            borderRadius: 5,
            flex: 1,
            fontSize: 14,
            marginBottom: 5
          }]}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={showPassword ? require("../assets/eye.png") : require("../assets/crossed_eye.png")}
            resizeMode='contain'
            style={{ marginLeft: 15, width: 17, height: 17, alignSelf: "center" }}
          />
        </TouchableOpacity>
      </View>
      {passwordError && (
        <Text style={[{color: "rgb(197, 57, 57)", fontSize: 14}]}>Invalid password</Text>
      )}
      <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 25}}>
        <TouchableOpacity style={[styles.deleteButton, {borderColor: colorMap[theme+"Red"]}]} onPress={() => deleteAccount(setLoggedIn, tempPassword, setPasswordError)}>
          <Text style={{color: colorMap[theme+"Text"], fontWeight: "semibold", textAlign: "center"}}>{translate("Delete")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cancelButton]} onPress={() => {setPressedDelete(false)}}>
          <Text style={{color: colorMap["darkText"], fontWeight: "semibold", textAlign: "center"}}>{translate("Cancel")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const LogoutPanel: React.FC<{
  theme: string;
  language: string;
  logout: () => void;
  setPressedLogout: (value: boolean) => void;
}> = ({ theme, language, logout, setPressedLogout, setLoggedIn}) => {
  
  const translate = (key: string): string => translation[language]?.[key] || key;
  
  return (
    <View style={[styles.logoutPanel, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <Text style={[{color: colorMap[theme+"Text"], fontSize: 18, fontWeight: 'semibold', textAlign: "center"}]}>{translate("Are you sure you want to log out")}</Text>
      <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 30}}>
        <TouchableOpacity style={[styles.deleteButton, {borderColor: colorMap[theme+"Widget4"]}]} onPress={logout}>
          <Text style={{color: colorMap[theme+"Text"], fontWeight: "semibold", textAlign: "center"}}>{translate("Log out")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => {setPressedLogout(false)}}>
          <Text style={{color: colorMap["darkText"], fontWeight: "semibold", textAlign: "center"}}>{translate("Cancel")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const UserSettings: React.FC<{ navigation: any; setLoggedIn:any }> = ({ navigation, setLoggedIn }) => {
  const [language, setLanguage] = useState<string>("ua");
  const [theme, setTheme] = useState<string>("dark");

  

  const [editingPassword, setEditingPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("abcd1234");
  const [tempPassword, setTempPassword] = useState<string>("abcd1234");

  const [showPassword, setShowPassword] = useState(false);

  const [keyboardOpened, setKeyboardOpened] = useState(false)

  const [pressedDelete, setPressedDelete] = useState(false)
  const [pressedLogout, setPressedLogout] = useState(false)

  
  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { updateStoredData, storedData } = storage;

  const name = storedData.name 
  
  const email = storedData.email

  const [editingName, setEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(name);


  const translate = (key: string): string => translation[language]?.[key] || key;

  const handleSaveName = async (name: string) => {
    updateStoredData("name", name);
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is currently logged in");
  
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: name
      });
  
      console.log("✅ Name updated in Firestore");
    } catch (error) {
      console.error("❌ Failed to update name in Firestore:", error);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedLanguage = storedData.language;
        const savedTheme = storedData.theme;

        if (savedLanguage) {
          setLanguage(savedLanguage);
        }

        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          setTheme("dark");
          await AsyncStorage.setItem("theme", "dark");
        }
      } catch (e) {
        console.error("Failed to load settings from storage", e);
      }
    };

    loadSettings();
  }, [storedData.language, storedData.theme]);


  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardOpened(true);
    });
  
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardOpened(false);
    });
  
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colorMap[theme + "Background"] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.header, { color: colorMap[theme + "Text"] }]}>{translate("User Settings")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.done}>
            <Text style={[styles.doneText, { color: colorMap["green"] }]}>{translate("Done")}</Text>
          </TouchableOpacity>
        </View>

        {/* Name Setting */}
        <View style={[styles.settingBox, { backgroundColor: colorMap[theme + "Widget"] }]}>
          <View style={styles.settingBox1}>
            <Image source={require("../assets/account.png")} style={styles.icon} />
            <View style={styles.detailContainer}>
              <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>{translate("Name")}</Text>
              {!editingName ? (
                <Text style={[styles.settingText, { color: colorMap[theme + "Text2"] }]}>{name}</Text>
              ) : (
                <TextInput
                  value={tempName}
                  onChangeText={setTempName}
                  style={[styles.settingText, {
                    color: colorMap[theme + "Text2"],
                    padding: 3,
                    backgroundColor: colorMap[theme+"Widget2"],
                    borderRadius: 3,
                    paddingLeft: 7
                  }]}
                />
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.edit} onPress={() => {
            if (editingName) handleSaveName(tempName);
            setEditingName(!editingName);
          }}>
            <Text style={styles.editText}>{translate(editingName ? "Save" : "Edit")}</Text>
          </TouchableOpacity>
        </View>

        {/* Email Setting */}
        <View style={[styles.settingBox, { backgroundColor: colorMap[theme + "Widget"] }]}>
          <View style={styles.settingBox1}>
            <Image source={require("../assets/email.png")} style={[styles.icon, {width: 42}]} resizeMode='contain' />
            <View style={styles.detailContainer}>
              <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>{translate("Email")}</Text>
              <Text style={[styles.settingText, { color: colorMap[theme + "Text2"] }]}>{email}</Text>
            </View>
          </View>
        </View>

        {/* Password Setting */}
        <View style={[styles.settingBox, { backgroundColor: colorMap[theme + "Widget"] }]}>
          <View style={styles.settingBox1}>
            <Image source={require("../assets/lock.png")} style={styles.icon} resizeMode='contain'/>
            <View style={styles.detailContainer}>
              <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>{translate("Password")}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!editingPassword ? (
                  <Text style={[styles.settingText, { color: colorMap[theme + "Text2"] }]}>{'*'.repeat(password.length)}</Text>
                ) : (
                  <>
                    <TextInput
                      value={tempPassword}
                      onChangeText={setTempPassword}
                      secureTextEntry={!showPassword}
                      style={[styles.settingText, {
                        color: colorMap[theme + "Text2"],
                        padding: 3,
                        backgroundColor: "rgb(24, 24, 24)",
                        borderRadius: 3
                      }]}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Image
                        source={showPassword ? require("../assets/eye.png") : require("../assets/crossed_eye.png")}
                        resizeMode='contain'
                        style={{ marginLeft: 15, width: 17 }}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
          {/* <TouchableOpacity style={styles.edit} onPress={() => {
            if (editingPassword) setPassword(tempPassword);
            setEditingPassword(!editingPassword);
          }}>
            <Text style={styles.editText}>{translate(editingPassword ? "Save" : "Edit")}</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      {!keyboardOpened && (<View style={styles.footer}>
        <View style={{flexDirection: "row-reverse", gap: 10}}>
          <TouchableOpacity style={[styles.logOutButton, {backgroundColor: colorMap[theme+"Widget2"]}]} onPress={() => {setPressedLogout(true)}}>
            <Text style={[styles.buttonText, { color: colorMap[theme + "Text"] }]}>{translate("Log out")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.deleteAccountButton, {borderColor: colorMap[theme+"Red"]}]} onPress={() => {setPressedDelete(true)}}>
            <Text style={[styles.buttonText, { color: colorMap[theme + "Text"] }]}>{translate("Delete Account")}</Text>
          </TouchableOpacity>
        </View>
      </View>)}

      {/* Tint */}
      {(pressedDelete || pressedLogout) && (
        <View style={{height: "100%", width: "100%", position: "absolute", backgroundColor: "rgba(0, 0, 0, 0.42)"}}></View>
      )}

      {/* Panels */}
      {pressedDelete && (
        <DeletePanel language={language} theme={theme} setLoggedIn={setLoggedIn} setPressedDelete={setPressedDelete}></DeletePanel>
      )}
      {pressedLogout && (
        <LogoutPanel language={language} theme={theme} logout={() => {logOut(setLoggedIn)}} setPressedLogout={setPressedLogout} ></LogoutPanel>
      )}
    </KeyboardAvoidingView>
  );
};

export default UserSettings;

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
  },
  header: {
    fontSize: 24,
    textAlign: "center",
  },
  done: {
    position: "absolute",
    right: 0,
  },
  doneText: {
    fontSize: 20,
  },
  settingBox: {
    height: 85,
    borderRadius: 20,
    flexDirection: "row",
    marginBottom: 20,
  },
  settingBox1: {
    alignItems: "center",
    flexDirection: "row",
  },
  settingName: {
    fontSize: 18,
  },
  settingText: {
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 15,
    height: 44,
    width: 44,
  },
  detailContainer: {},
  edit: {
    position: "absolute",
    right: 0,
    marginTop: 15,
    marginRight: 20,
  },
  editText: {
    fontSize: 16,
    color: colorMap["green"],
  },
  footer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  logOutButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgb(48, 48, 48)",
    marginBottom: 10,
    justifyContent: "center",
    flex: 1
  },
  deleteAccountButton: {
    height: 50,
    borderRadius: 16,
    borderColor: "rgb(48, 48, 48)",
    borderWidth: 1.5,
    justifyContent: "center",
    flex: 1
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center"
  },
  deletePanel: {
    position: 'absolute',
    top: '25%', 
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300, 
    padding: 20,
    borderRadius: 18
  },
  logoutPanel: {
    position: 'absolute',
    top: '30%', 
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300, 
    padding: 20,
    paddingBottom: 20,
    borderRadius: 18
  },
  deleteButton: {
    borderColor: "#4b4b4b",
    borderWidth: 1,
    borderRadius: 12,
    height: 40,
    width: 120, 
    alignContent: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colorMap["green"],
    borderRadius: 12,
    height: 40,
    width: 120, 
    alignContent: 'center',
    justifyContent: 'center',
  },
 
})
