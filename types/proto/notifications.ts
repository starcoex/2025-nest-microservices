// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v5.29.2
// source: proto/notifications.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "notifications";

export interface Empty {
}

export interface NotifyEmailMessage {
  email: string;
  text: string;
  subject: string;
  name: string;
  templatePath: string;
  activationCode: string;
  data: NotifyEmailMessage_Data | undefined;
}

export interface NotifyEmailMessage_Data {
  title: string;
  content: string;
}

export const NOTIFICATIONS_PACKAGE_NAME = "notifications";

export interface NotificationsServiceClient {
  notifyEmail(request: NotifyEmailMessage): Observable<Empty>;
}

export interface NotificationsServiceController {
  notifyEmail(request: NotifyEmailMessage): Promise<Empty> | Observable<Empty> | Empty;
}

export function NotificationsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["notifyEmail"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("NotificationsService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("NotificationsService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const NOTIFICATIONS_SERVICE_NAME = "NotificationsService";
