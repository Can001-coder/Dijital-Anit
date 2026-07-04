package com.dijitalanit.handler;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionDetail<E> {

	private String path;
	private Date createTime;
	private String hostName;
	private E message;
}
