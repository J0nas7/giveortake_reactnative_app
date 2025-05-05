import { NativeModules, Platform } from 'react-native';
import type { TaskTimeTrack } from '@/src/Types'; // adjust the path as needed

const { TimeTracking } = NativeModules;

export function startLiveActivity(track: TaskTimeTrack) {
    if (Platform.OS === 'ios' && TimeTracking?.startActivity) {
        TimeTracking.startActivity();
    }
}

export function updateLiveActivity(taskName: string, timeSpend: string) {
    if (Platform.OS === 'ios' && TimeTracking?.updateActivity) {
        TimeTracking.updateActivity(taskName, timeSpend);
    }
}

export function endLiveActivity() {
    if (Platform.OS === 'ios' && TimeTracking?.endActivity) {
        TimeTracking.endActivity();
    }
}
