import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../color";

const heart = require("../assets/heart.png");
const activeHeart = require("../assets/activeHeart.png");

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(false);
  const navigation = useNavigation();

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useLayoutEffect(() => {
    const collectionRef = collection(database, "chats");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("querySnapshot unsusbscribe");
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return unsubscribe;
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    // setMessages([...messages, ...messages]);
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  const renderQuickReplies = (e) => {
    return (
      <View>
        <Text>Hiii</Text>
      </View>
    );
  };

  const renderBubble = (props) => (
    <View
      style={{
        flexDirection: props.position === "right" ? "row-reverse" : "row",
      }}
    >
      {/* <Bubble {...props} /> */}
      <View
        style={{
          backgroundColor: "#DDDDDD",
          maxWidth: 200,
          padding: 10,
          borderRadius: 10,
          marginRight: props.position === "right" ? 0 : 8,
          marginLeft: props.position === "left" ? 0 : 8,
        }}
      >
        <Text>{props.currentMessage.text}</Text>
      </View>

      <TouchableOpacity
        index={props.currentMessage._id}
        style={{ justifyContent: "center", alignItems: "center" }}
        onPress={() => {
          setActive(true);
        }}
      >
        <Image
          style={{ width: 15, height: 13 }}
          resizeMode="contain"
          source={active ? activeHeart : heart}
        />
      </TouchableOpacity>
    </View>
  );

  const onQuickReply = (replies) => {
    const createdAt = new Date();
    if (replies.length === 1) {
      this.onSend([
        {
          createdAt,
          _id: Math.round(Math.random() * 1000000),
          text: replies[0].title,
          user,
        },
      ]);
    } else if (replies.length > 1) {
      this.onSend([
        {
          createdAt,
          _id: Math.round(Math.random() * 1000000),
          text: replies.map((reply) => reply.title).join(", "),
          user,
        },
      ]);
    } else {
      console.warn("replies param is not set correctly");
    }
  };

  const renderQuickReplySend = () => <Text>{" custom send =>"}</Text>;

  return (
    // <>
    //   {messages.map(message => (
    //     <Text key={message._id}>{message.text}</Text>
    //   ))}
    // </>
    <View style={{ flex: 1, marginBottom: 100 }}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={(messages) => onSend(messages)}
        messagesContainerStyle={{
          backgroundColor: "#fff",
        }}
        textInputStyle={{
          backgroundColor: "#fff",
          borderRadius: 20,
        }}
        user={{
          _id: auth?.currentUser?.email,
          avatar: "https://i.pravatar.cc/300",
        }}
        // renderBubble={renderBubble}
        renderQuickReplies={renderQuickReplies}
        quickReplyStyle={{ backgroundColor: "red" }}
        renderQuickReplySend={renderQuickReplySend}
        //   renderTicks={renderTicks}
      />
    </View>
  );
}
