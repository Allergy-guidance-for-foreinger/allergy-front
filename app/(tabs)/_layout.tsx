import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: '#9CA3AF',
            }}
        >

            <Tabs.Screen
                name="main"
                options={{
                    title: 'Menu',
                    // color  Active/Inactive 색상을 자동으로 받음
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="fast-food-outline" size={24} color={color} />
                    ),
                }}
            />

            {/* 2. 두 번째 탭: 설정 화면 */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="settings-outline" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
