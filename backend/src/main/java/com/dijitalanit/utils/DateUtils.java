package com.dijitalanit.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

public class DateUtils {

	public static String getCurrentDate(Date date) {
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd-MM-yyyy");
		return simpleDateFormat.format(date);
	}

	public static String formatDateTime(Date date) {
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm");
		return simpleDateFormat.format(date);
	}
}
