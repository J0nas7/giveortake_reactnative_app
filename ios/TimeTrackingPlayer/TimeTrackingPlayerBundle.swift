//
//  TimeTrackingPlayerBundle.swift
//  TimeTrackingPlayer
//
//  Created by Jonas Alexander Sørensen on 04/05/2025.
//

import WidgetKit
import SwiftUI

@main
struct TimeTrackingPlayerBundle: WidgetBundle {
    var body: some Widget {
        TimeTrackingPlayer()
        TimeTrackingPlayerControl()
        TimeTrackingPlayerLiveActivity()
    }
}
