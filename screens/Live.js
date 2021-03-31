import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View, Dimensions } from 'react-native';

import RtcEngine, { ChannelProfile, ClientRole } from "react-native-agora";

import { RtcLocalView, RtcRemoteView } from "react-native-agora";

export default function Live(props) {
  const AgoraEngine = useRef();
  const [joined, setJoined] = useState(false);

  const isBroadcaster = props.route.params.type === "create";

  const init = async () => {
    if(Platform.OS === 'android') await requestAndroidPermissions();
    AgoraEngine.current = await RtcEngine.create("0055f4aa3edf469c8d653df4fb899687");
    AgoraEngine.current.enableVideo();
    AgoraEngine.current.setChannelProfile(ChannelProfile.LiveBroadcasting);
    if (isBroadcaster) AgoraEngine.current.setClientRole(ClientRole.Broadcaster);
    
    AgoraEngine.current.addListener("JoinChannelSuccess", (channel, uid, elapsed) => {
      console.log("JoinChannelSuccess", channel, uid, elapsed);
      setJoined(true);
    });
  };

  useEffect(() => {
    const uid = isBroadcaster ? 1 : 0;
    init().then(() => AgoraEngine.current.joinChannel(null, props.route.params.channel, null, uid));
    return () => {
      AgoraEngine.current.destroy();
    };
  }, []);

  return (
    <View style={styles.container}>
    {!joined ? (
      <>
        <ActivityIndicator
          size={60}
          color="#222"
          style={styles.activityIndicator}
        />
        <Text style={styles.loadingText}>Joining Stream, Please Wait</Text>
      </>
    ) : (
      <>
        {isBroadcaster ? (
          <RtcLocalView.SurfaceView 
            style={styles.fullscreen} 
            channelId={props.route.params.channel} 
          />
        ) : (
          <RtcRemoteView.SurfaceView 
            uid={1} 
            style={styles.fullscreen} 
            channelId={props.route.params.channel} 
          />
        )}
      </>
    )}
  </View>
  );
}

async function requestAndroidPermissions() {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    if (
      granted['android.permission.RECORD_AUDIO'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.CAMERA'] ===
        PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('You can use the cameras & mic');
    } else {
      console.log('Permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}


const dimensions = {
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#222',
  },
  fullscreen: {
    width: dimensions.width,
    height: dimensions.height,
  },
});