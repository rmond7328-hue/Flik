import { Animated, Text, View } from 'react-native';
import { useEffect,useRef } from 'react';
export function Toast({message}:{message:string}){const y=useRef(new Animated.Value(30)).current;useEffect(()=>{Animated.spring(y,{toValue:0,useNativeDriver:true}).start()},[message]);return <Animated.View style={{position:'absolute',left:16,right:16,bottom:24,transform:[{translateY:y}],zIndex:20}}><View style={{backgroundColor:'#111',paddingHorizontal:16,paddingVertical:13,borderRadius:14}}><Text style={{color:'#fff',fontWeight:'700'}}>{message}</Text></View></Animated.View>}
