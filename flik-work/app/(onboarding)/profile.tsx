import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Camera, UserRound } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';
import { updateProfile, usernameAvailable } from '../../services/profile';
import { colors, radius, shadow, spacing, type } from '../../constants/theme';

export default function ProfileSetup() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(''); const [username, setUsername] = useState(''); const [bio, setBio] = useState(''); const [busy, setBusy] = useState(false);
  async function next() {
    if (!user || name.trim().length < 2 || !/^[a-zA-Z0-9_]{3,24}$/.test(username)) return Alert.alert('Complete your profile', 'Use a name and a username with 3–24 letters, numbers, or underscores.');
    setBusy(true); const check = await usernameAvailable(username.toLowerCase(), user.id);
    if (!check.available) { setBusy(false); return Alert.alert('Username unavailable', 'Try another username.'); }
    const { error } = await updateProfile(user.id, { full_name: name.trim(), username: username.toLowerCase(), bio: bio.trim() });
    setBusy(false); if (error) return Alert.alert('Could not save profile', error.message); router.push('/(onboarding)/campus');
  }
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.content}>
    <View style={styles.progress}><View style={styles.progressActive}/><View/><View/></View><Text style={styles.eyebrow}>STEP 1 OF 3</Text><Text style={styles.title}>Make your profile yours.</Text><Text style={styles.subtitle}>Your campus will see this when you share a moment or join a community.</Text>
    <View style={styles.avatarWrap}><View style={styles.avatar}><UserRound size={42} color={colors.accentStrong}/></View><View style={styles.camera}><Camera size={16} color={colors.white}/></View></View>
    <View style={styles.form}><View><Text style={styles.label}>Full name</Text><TextInput value={name} onChangeText={setName} placeholder="Raymond N." placeholderTextColor={colors.subtle} style={styles.input}/></View><View><Text style={styles.label}>Username</Text><TextInput autoCapitalize="none" value={username} onChangeText={setUsername} placeholder="@raymond_" placeholderTextColor={colors.subtle} style={styles.input}/></View><View><Text style={styles.label}>Bio <Text style={styles.optional}>Optional</Text></Text><TextInput value={bio} onChangeText={setBio} placeholder="Tell your campus a little about you" placeholderTextColor={colors.subtle} multiline maxLength={120} style={[styles.input, styles.bio]}/></View></View>
    <Pressable onPress={next} disabled={busy} style={({pressed}) => [styles.button, pressed && styles.pressed, busy && styles.disabled]}><Text style={styles.buttonText}>{busy ? 'Saving…' : 'Continue'}</Text></Pressable>
  </View></KeyboardAvoidingView>;
}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:colors.background},content:{flex:1,padding:spacing.lg,paddingTop:58},progress:{height:4,borderRadius:4,backgroundColor:colors.surfaceStrong,flexDirection:'row',overflow:'hidden',marginBottom:spacing.xl},progressActive:{flex:1,backgroundColor:colors.accentStrong},eyebrow:{...type.meta,color:colors.accentStrong,letterSpacing:1.1},title:{...type.display,color:colors.text,marginTop:7},subtitle:{...type.body,color:colors.muted,marginTop:9,maxWidth:350},avatarWrap:{alignSelf:'center',marginVertical:spacing.lg},avatar:{width:104,height:104,borderRadius:52,backgroundColor:colors.accentSoft,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.border},camera:{position:'absolute',right:0,bottom:0,width:34,height:34,borderRadius:17,backgroundColor:colors.accentStrong,alignItems:'center',justifyContent:'center',...shadow.floating},form:{gap:spacing.md},label:{...type.label,color:colors.text,marginBottom:7},optional:{...type.meta,color:colors.subtle},input:{minHeight:52,borderWidth:1,borderColor:colors.border,borderRadius:radius.md,backgroundColor:colors.white,paddingHorizontal:15,color:colors.text,fontFamily:'DMSans_400Regular',fontSize:15},bio:{height:92,paddingTop:14,textAlignVertical:'top'},button:{height:54,borderRadius:radius.md,backgroundColor:colors.accentStrong,alignItems:'center',justifyContent:'center',marginTop:'auto',marginBottom:10},buttonText:{...type.button,color:colors.white},pressed:{transform:[{scale:.985}]},disabled:{opacity:.65}});
