//
//  TimeTrackingModuleHeader.m
//  giveortake_reactnative_app
//
//  Created by Jonas Alexander Sørensen on 04/05/2025.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TimeTracking, NSObject)

RCT_EXTERN_METHOD(startActivity)
RCT_EXTERN_METHOD(updateActivity: (NSString *) taskName timeSpend: (NSString *) timeSpend)
RCT_EXTERN_METHOD(endActivity)

@end
