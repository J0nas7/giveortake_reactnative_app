//
//  TimeTrackingPlayerLiveActivity.swift
//  TimeTrackingPlayer
//
//  Created by Jonas Alexander Sørensen on 04/05/2025.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct TimeTrackingPlayerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var taskName: String
        var timeSpend: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct TimeTrackingPlayerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimeTrackingPlayerAttributes.self) { context in
            // Lock screen/banner UI goes here
            HStack {
                VStack(alignment: .leading) {
                    Text("\(context.state.taskName)")

                    Text("\(context.state.timeSpend)")
                }

                Spacer()
                
                // Red button as a link
                Link(destination: URL(string: "giveortake://endLiveActivity")!) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 44, height: 44)
                        .overlay(
                            Image(systemName: "xmark")
                                .foregroundColor(.white)
                        )
                }
            }
            .padding(10)
            .activityBackgroundTint(Color(red: 0.290, green: 0.871, blue: 0.502))
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text("\(context.state.taskName)")

                        Text("\(context.state.timeSpend)")
                    }
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T")
            } minimal: {
                Text("M")
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension TimeTrackingPlayerAttributes {
    fileprivate static var preview: TimeTrackingPlayerAttributes {
        TimeTrackingPlayerAttributes(name: "World")
    }
}

extension TimeTrackingPlayerAttributes.ContentState {
    fileprivate static var smiley: TimeTrackingPlayerAttributes.ContentState {
        TimeTrackingPlayerAttributes.ContentState(taskName: "To do 📝", timeSpend: "00:00:00")
     }
}

#Preview("Notification", as: .content, using: TimeTrackingPlayerAttributes.preview) {
   TimeTrackingPlayerLiveActivity()
} contentStates: {
    TimeTrackingPlayerAttributes.ContentState.smiley
}
