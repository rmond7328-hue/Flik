import { View } from 'react-native';
export function Skeleton({height=20,width='100%',radius=10}:{height?:number;width?:any;radius?:number}){return <View style={{height,width,borderRadius:radius,backgroundColor:'#F1F5F9'}}/>}
