import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

class AuthService {
  // Email and Password Authentication
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, password, displayName, phoneNumber) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: displayName,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        phoneNumber: phoneNumber,
        createdAt: new Date(),
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Phone Number Authentication
  async setupRecaptcha() {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
        },
        auth
      );
      return recaptchaVerifier;
    } catch (error) {
      console.error("Error setting up reCAPTCHA:", error);
      throw error;
    }
  }

  async sendPhoneVerification(phoneNumber, recaptchaVerifier) {
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      return confirmationResult;
    } catch (error) {
      throw error;
    }
  }

  async verifyPhoneCode(confirmationResult, code) {
    try {
      const userCredential = await confirmationResult.confirm(code);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async confirmPhoneVerification(
    confirmationResult,
    verificationCode,
    displayName
  ) {
    try {
      const userCredential = await confirmationResult.confirm(verificationCode);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: displayName,
      });

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: displayName,
        createdAt: new Date(),
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user data
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid)); // Change from 'firestore' to 'db'
      if (userDoc.exists()) {
        return { success: true, userData: userDoc.data() };
      } else {
        return { success: false, error: "User not found" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();
