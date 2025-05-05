//
//  TimeTrackingModule.swift
//  giveortake_reactnative_app
//
//  Created by Jonas Alexander Sørensen on 04/05/2025.
//

import Foundation
import ActivityKit

@objc(TimeTracking)
class TimeTracking: NSObject {
  
  @objc(startActivity)
  func startActivity() {
    do {
      if #available(iOS 16.1, *) {
        let timeTrackingAttributes = TimeTrackingPlayerAttributes(name: "Time Tracking")
        let timeTrackingContentState = TimeTrackingPlayerAttributes.ContentState.init(taskName: "Working on a task", timeSpend: "00:00:00")
        
        let activity = try Activity<TimeTrackingPlayerAttributes>.request(attributes: timeTrackingAttributes, contentState: timeTrackingContentState, pushType: nil)
      } else {
        print("Live Activity is not supported on this device")
      }
    } catch (let error) {
      print("There is some error with TimeTrackingModule")
    }
  }
  
  @objc(updateActivity:timeSpend:)
  func updateActivity(taskName: String, timeSpend: String) {
    do {
      if #available(iOS 16.1, *) {
        let timeTrackingContentState = TimeTrackingPlayerAttributes.ContentState.init(taskName: taskName, timeSpend: timeSpend)
        
        Task {
          for activity in Activity<TimeTrackingPlayerAttributes>.activities {
            await activity.update(using: timeTrackingContentState)
          }
        }
      } else {
        print("Live Activity is not supported on this device")
      }
    } catch (let error) {
      print("There is some error with TimeTrackingModule")
    }
  }
  
  @objc(endActivity)
  func endActivity() {
    Task {
      for activity in Activity<TimeTrackingPlayerAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }
  }
}
